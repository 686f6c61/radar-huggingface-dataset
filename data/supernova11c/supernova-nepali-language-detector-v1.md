# Supernova11c/Supernova-Nepali-Language-Detector-V1

## Resumen

Supernova Nepali Language Detector V1 es un sistema de identificación de idioma determinista desarrollado por el proyecto Supernova AI. A diferencia de los modelos basados en redes neuronales, este detector no utiliza pesos preentrenados ni inferencia neuronal, sino que se basa en huellas lingüísticas, estadísticas de vocabulario, análisis de script Unicode y puntuación calibrada para clasificar textos. Su objetivo principal es distinguir entre nepalí, hindi, sánscrito e inglés, además de manejar casos de nepalí en alfabeto latino, textos mixtos y entradas desconocidas.

La relevancia de esta herramienta radica en su ligereza y reproducibilidad: al ser determinista, no requiere GPU ni dependencias de aprendizaje automático, lo que la hace adecuada para entornos con recursos limitados o para integración en pipelines de procesamiento de lenguaje natural donde se necesita una clasificación rápida y consistente. El repositorio tiene un tamaño de 0.0 GB, confirmando que no incluye pesos de modelos.

El modelo fue creado el 16 de agosto de 2026 y está publicado bajo licencia Apache 2.0, lo que permite su uso comercial y modificación. Aunque su alcance es específico para cuatro idiomas principales, su diseño modular podría extenderse a otros sistemas de escritura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Determinista (basada en reglas, sin redes neuronales) |
| Parametros totales | No aplica (no contiene pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | ne, hi, sa, en (además de nepalí latino, mixto y desconocido) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (código fuente Python) |

## Arquitectura y entrenamiento

El sistema no sigue una arquitectura de transformer ni de mezcla de expertos. En su lugar, emplea un conjunto de reglas deterministas que combinan huellas lingüísticas (patrones de caracteres específicos de cada idioma), estadísticas de vocabulario (frecuencia de palabras comunes), análisis del sistema de escritura (detección de Devanagari, latino, etc.) y un sistema de puntuación calibrada para asignar una confianza entre 0.0 y 1.0. El diseño incluye reglas dedicadas para el nepalí escrito en alfabeto latino, lo que permite distinguir este caso del inglés.

No existe un proceso de entrenamiento en el sentido tradicional: no se utilizan datasets masivos ni fases de ajuste con RLHF o DPO. La verificación se realizó mediante un benchmark final independiente que el modelo superó con 7 de 7 pruebas. La ausencia de pesos preentrenados elimina el riesgo de sesgos derivados de datos de entrenamiento, aunque introduce limitaciones en la generalización a variantes dialectales o textos muy cortos.

## Capacidades

- Detección de idioma para nepalí, hindi, sánscrito e inglés.
- Identificación de nepalí escrito en alfabeto latino (p. ej., "ma aaja school janchu").
- Clasificación de textos mixtos (combinación de scripts o idiomas).
- Devolución de "Unknown" cuando no hay suficiente evidencia.
- Salida estructurada con tres campos: idioma detectado, confianza (0.0-1.0) y script detectado (Devanagari, Latin, Mixed, Unknown).
- Funcionamiento 100% offline, sin necesidad de GPU ni llamadas a APIs externas.
- Reproducibilidad total: el mismo texto siempre produce el mismo resultado.

## Casos de uso

- Clasificación automática de documentos en nepalí e hindi: útil para archivos gubernamentales o bibliotecas digitales que necesitan etiquetar contenido en estos idiomas de forma fiable y sin depender de servicios en la nube.
- Preprocesamiento en pipelines de NLP: antes de aplicar un modelo de análisis de sentimiento o traducción, se puede usar este detector para enrutar textos al modelo adecuado según su idioma, reduciendo errores de idioma incorrecto.
- Filtrado de contenido multilingüe en redes sociales: para moderar comentarios en nepalí, hindi o inglés, el detector permite separar los mensajes por idioma y aplicar políticas específicas.
- Etiquetado de datos para entrenamiento de modelos: al generar datasets anotados, este sistema puede asignar automáticamente la etiqueta de idioma a cada muestra, acelerando la preparación de datos.
- Chatbots con soporte multilingüe: en una aplicación de atención al cliente que opera en Nepal o India, el detector identifica el idioma de la consulta del usuario y selecciona el flujo de respuesta correspondiente.
- Análisis de sentimiento en textos cortos de nepalí: aunque la confianza puede ser baja en frases breves, el detector ayuda a aislar textos nepalíes para análisis posteriores con modelos específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, más allá de la mención de que el modelo "pasó su benchmark final independiente con 7/7 tests". No se proporcionan métricas comparativas como precisión, recall o F1 frente a otros detectores. Por tanto, no es posible evaluar su rendimiento relativo de forma cuantitativa.

## Requisitos de hardware

- No requiere GPU: el sistema es puramente de CPU, ejecutable en cualquier ordenador o incluso en dispositivos embebidos.
- Memoria RAM mínima: al no cargar pesos, el consumo es insignificante (menos de 100 MB).
- Compatible con entornos de producción ligeros, como funciones serverless o dispositivos IoT.
- Despliegue sencillo: basta con clonar el repositorio e importar el módulo `detector` en Python.
- No se dispone de datos de latencia o throughput, pero al ser determinista y sin cálculo pesado, se espera que la inferencia sea prácticamente instantánea incluso en hardware modesto.

## Comparativa con modelos similares

No se dispone de información sobre otros detectores de idioma comparables (como fastText, langdetect o CLD3) en términos de rendimiento o características específicas. Por tanto, no se puede establecer una comparativa cuantitativa. No obstante, a diferencia de estos, Supernova V1 no requiere descargar modelos preentrenados ni depende de frameworks de aprendizaje automático, lo que lo hace más ligero y fácil de auditar.

## Limitaciones y advertencias

- Los idiomas nepalí, hindi y sánscrito comparten el alfabeto Devanagari, por lo que textos muy cortos o ambiguos pueden clasificarse incorrectamente.
- La confianza devuelta puede ser baja incluso para frases claras (en el ejemplo oficial, "नेपाल सुन्दर देश हो।" obtiene una confianza de 0.17), lo que sugiere que el umbral de decisión podría requerir calibración adicional.
- El sistema devuelve "Unknown" cuando no hay evidencia suficiente, lo que puede ser una limitación en aplicaciones que requieran una clasificación forzosa.
- No es un modelo generativo ni tiene capacidades de razonamiento; su única función es la identificación de idioma.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los archivos del repositorio para confirmar que no hay restricciones adicionales.
- Al ser determinista, no aprende de nuevos datos; si se necesita soporte para otros idiomas o dialectos, habría que modificar las reglas manualmente.

## Enlaces

- [HuggingFace: Supernova11c/Supernova-Nepali-Language-Detector-V1](https://huggingface.co/Supernova11c/Supernova-Nepali-Language-Detector-V1)
