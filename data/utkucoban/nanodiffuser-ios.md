# utkucoban/NanoDiffuser-iOS

## Resumen

NanoDiffuser-iOS es una conversión a ONNX del modelo de difusión texto-a-imagen NanoDiffuser, empaquetada específicamente para su ejecución en iPhone. El autor, utkucoban, ha convertido los pesos de cómputo de FP16 a FP32 para que el proveedor de CPU de ONNX Runtime pueda ejecutar el modelo en cualquier iPhone desde el 6s en adelante, manteniendo las variantes de 4 y 8 bits cuantizadas. No se trata de un modelo nuevo, sino de un artefacto de despliegue derivado del modelo base utkucoban/NanoDiffuser.

El modelo resuelve el problema de llevar generación de imágenes por difusión a dispositivos móviles Apple sin depender de la nube: la app descarga los ficheros desde un commit fijado, verifica cada uno con SHA-256 y genera las imágenes localmente, sin enviar datos al exterior. El repositorio ocupa 0,5 GB y se distribuye bajo licencia CreativeML Open RAIL++-M.

La relevancia de esta ficha es acotada: se trata de un artefacto de distribución con 0 descargas y 0 likes en el momento de la consulta, orientado a un caso de uso muy concreto (inferencia local en iOS mediante ONNX Runtime). No se dispone de información sobre arquitectura interna, número de parámetros ni datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion texto-a-imagen; arquitectura interna no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen, no de lenguaje) |
| Tipos de cuantizacion | FP32 (computo), 4 bits y 8 bits (pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | CreativeML Open RAIL++-M |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base NanoDiffuser (tipo de backbone, mecanismo de atención, número de bloques, etc.). El artefacto aquí descrito es una conversión de formato: el cómputo en FP16 del modelo original se ha convertido a FP32 para permitir su ejecución con el proveedor de CPU de ONNX Runtime en iPhones desde el 6s, mientras que las variantes de pesos de 4 y 8 bits permanecen cuantizadas. Esta conversión FP16→FP32 busca compatibilidad con hardware antiguo que no soporta operaciones en media precisión de forma eficiente o consistente en CPU.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO (poco habituales en modelos de difusión). No se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La única información técnica concreta es el pipeline de despliegue: descarga desde commit fijado, verificación SHA-256 por fichero e inferencia local en el dispositivo.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image), ejecutada localmente en el iPhone.
- Ejecución en CPU mediante el proveedor de ONNX Runtime, con soporte declarado desde el iPhone 6s en adelante.
- Variantes de pesos en 4 bits y 8 bits para reducir el uso de memoria y almacenamiento en el dispositivo.
- Procesamiento completamente en el dispositivo: las imágenes se generan en el teléfono y no se envían datos a servidores externos.
- Verificación de integridad de los ficheros descargados mediante SHA-256 contra un commit fijado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento.

## Casos de uso

- Generación de imágenes offline en iPhone: la app descarga los pesos una vez y genera imágenes sin conexión, adecuado para entornos con conectividad limitada o requisitos de privacidad estrictos.
- Aplicaciones de privacidad por diseño: al no enviarse datos al exterior, encaja en apps que no pueden subir prompts ni imágenes a la nube por cumplimiento normativo (por ejemplo, RGPD en el contexto europeo).
- Prototipado rápido de apps de creación de imágenes en iOS: el formato ONNX y las variantes cuantizadas permiten integrar el modelo en proyectos con ONNX Runtime sin reentrenar ni reconvertir pesos.
- Demos y pruebas de concepto en dispositivos antiguos: la conversión a FP32 amplía la compatibilidad hasta el iPhone 6s, útil para validar viabilidad en parques de dispositivos heterogéneos.
- Distribución de artefactos verificables: el esquema de commit fijado más SHA-256 sirve como referencia para pipelines de entrega de modelos en apps móviles.
- Investigación sobre inferencia de difusión en CPU móvil: permite medir latencia y consumo en hardware Apple sin acceso a GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica directamente (ejecución en CPU de iPhone); el consumo de memoria depende de la variante de cuantización (4 bits, 8 bits o FP32) y del tamaño del modelo base, que no se especifica.
- GPU recomendadas: no aplica; el artefacto está orientado al proveedor de CPU de ONNX Runtime.
- Compatibilidad consumer: iPhones desde el 6s en adelante, según declara el autor.
- Opciones de despliegue: ONNX Runtime con proveedor de CPU; integración en app iOS mediante descarga de ficheros desde commit fijado y verificación SHA-256.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (difusión texto-a-imagen en ONNX para iOS) ni de datos de rendimiento del modelo base que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Artefacto de despliegue, no modelo original: es una conversión de utkucoban/NanoDiffuser; cualquier limitación del modelo base se hereda y no está documentada aquí.
- Sin datos de arquitectura, parámetros ni entrenamiento: no es posible evaluar calidad, sesgos ni cobertura lingüística a partir de la información disponible.
- Idiomas no especificados: se desconoce qué idiomas soportan los prompts de texto.
- Riesgo de alucinación visual y sesgos: inherente a los modelos de difusión; no hay documentación específica del autor sobre sesgos conocidos.
- Licencia CreativeML Open RAIL++-M: incluye restricciones de uso basadas en el uso (Attachment A); es obligatorio revisar MODEL_LICENSE.md antes de un uso comercial.
- Rendimiento en CPU: la ejecución en CPU de iPhone puede implicar latencias altas; no se publican cifras.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; proyecto con escasa validación por la comunidad.
- Dependencia de ONNX Runtime y de la app: el uso práctico está ligado a la aplicación iOS del autor y a su esquema de descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/utkucoban/NanoDiffuser-iOS
- Modelo base: https://huggingface.co/utkucoban/NanoDiffuser
- Licencia del modelo (MODEL_LICENSE.md, referenciada en la model card): https://huggingface.co/utkucoban/NanoDiffuser-iOS/blob/main/MODEL_LICENSE.md
