---
order: 7
title: 数据拷贝工具类
date: 2021-10-15
category: 
    - Spring Boot
tag: 
    - Spring Boot
timeline: true
article: true
---

数据拷贝工具类代码

```java
public class ObjectUtil {

    /**
     * 拷贝source非空的值到target
     * @param source 被拷贝对象
     * @param target 拷贝目标对象
     */
    public static void copyNonNullProperties(Object source, Object target) {
        BeanUtils.copyProperties(source, target, getNullFiledNames(source));
    }

    /**
     * 拷贝source的值到target
     * @param source 被拷贝对象
     * @param target 拷贝目标对象
     */
    public static void copyProperties(Object source, Object target) {
        BeanUtils.copyProperties(source, target);
    }

    /**
     * 根据属性名获取属性值
     * */
    public static Object getValueByName(String fieldName, Object o) {
        try {
            String firstLetter = fieldName.substring(0, 1).toUpperCase();
            String getter = "get" + firstLetter + fieldName.substring(1);
            Method method = o.getClass().getMethod(getter);
            method.setAccessible(true);
            return method.invoke(o);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 获取属性名数组
     * */
    public static String[] getFiledName(Object o) {
        Field[] fields = o.getClass().getDeclaredFields();
        String[] fieldNames = new String[fields.length];
        for (int i = 0; i \< fields.length; i++) {
            fieldNames[i] = fields[i].getName();
        }
        return fieldNames;
    }

    /**
     * 获取值为NULL的字段名称数组
     * @param o Object
     * @return String[]
     */
    public static String[] getNullFiledNames(Object o) {
        String[] fieldNames = getFiledName(o);
        List\<String> nullFieldNames = new ArrayList\<>();
        for (String fieldName : fieldNames) {
            if (getValueByName(fieldName, o) == null) {
                nullFieldNames.add(fieldName);
            }
        }
        int size = nullFieldNames.size();
        return nullFieldNames.toArray(new String[size]);
    }

    /**
     * 获取属性类型(type)，属性名(name)，属性值(value)的map组成的list
     * */
    public static List\<Map\<String, Object>> getFieldsInfo(Object o) {
        Field[] fields = o.getClass().getDeclaredFields();
        List\<Map\<String, Object>> list = new ArrayList\<>();
        Map\<String, Object> infoMap;
        for (Field field : fields) {
            infoMap = new HashMap\<>(3);
            infoMap.put("type", field.getType().toString());
            infoMap.put("name", field.getName());
            infoMap.put("value", getValueByName(field.getName(), o));
            list.add(infoMap);
        }
        return list;
    }

    /**
     * 获取对象的所有属性值，返回一个对象数组
     * */
    public static Object[] getFiledValues(Object o) {
        String[] fieldNames = getFiledName(o);
        Object[] value = new Object[fieldNames.length];
        for (int i = 0; i \< fieldNames.length; i++) {
            value[i] = getValueByName(fieldNames[i], o);
        }
        return value;
    }

    /**
     * Map => Object
     * @param map Map\<Object, Object>
     * @param beanClass Class\<?> beanClass
     * @return Object
     * @throws Exception e
     */
    public static Object mapToObject(Map\<Object, Object> map, Class\<?> beanClass) throws Exception {
        if (map == null) {
            return null;
        }
        Object obj = beanClass.newInstance();
        Field[] fields = obj.getClass().getDeclaredFields();
        for (Field field : fields) {
            int mod = field.getModifiers();
            if (Modifier.isStatic(mod) || Modifier.isFinal(mod)) {
                continue;
            }
            field.setAccessible(true);
            if (map.containsKey(field.getName())) {
                field.set(obj, map.get(field.getName()));
            }
        }
        return obj;
    }

    /**
     * Object => Map
     * @param obj Object
     * @return Map\<String, Object>
     * @throws IllegalAccessException e
     */
    public static Map\<String, Object> getObjectToMap(Object obj) throws IllegalAccessException {
        Map\<String, Object> map = new LinkedHashMap\<String, Object>();
        Class\<?> clazz = obj.getClass();
        for (Field field : clazz.getDeclaredFields()) {
            field.setAccessible(true);
            String fieldName = field.getName();
            Object value = field.get(obj);
            if (value == null){
                value = "";
            }
            map.put(fieldName, value);
        }
        return map;
    }

}
```

