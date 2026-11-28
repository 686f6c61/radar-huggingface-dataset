# warped-community/LFM2.5-1.2B-Instruct-litert-lm

## Resumen

LFM2.5-1.2B-Instruct-litert-lm es un espejo del modelo LiquidAI/LFM2.5-1.2B-Instruct convertido al formato LiteRT-LM (anteriormente TensorFlow Lite) para su ejecución en dispositivos móviles. Lo mantiene la organización warped-community para integrarlo en la aplicación Android Warped. No se trata de un modelo nuevo ni de un fine-tuning: es una redistribución del artefacto `LFM2.5-1.2B-Instruct_int8.litertlm` publicado originalmente por litert-community, con el modelo de LiquidAI como base.

El modelo subyacente pertenece a la familia LFM2.5 de LiquidAI, con 1.200 millones de parámetros y orientación a instrucciones, pero la información disponible en esta ficha no incluye detalles sobre su arquitectura interna, datos de entrenamiento ni benchmarks. El repositorio ocupa 2,0 GB, lo que es coherente con pesos cuantizados a int8 para un modelo de ese tamaño.

Su relevancia es operativa: permite desplegar un modelo de instrucciones de ~1,2B parámetros en Android mediante el runtime LiteRT-LM, sin depender de servidores. Para desarrolladores que quieran reproducir el pipeline de Warped o usar el mismo artefacto en sus propias aplicaciones móviles, este repositorio ofrece una copia estable y con trazabilidad hacia el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1,2 mil millones (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (artefacto `_int8.litertlm`); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | LiteRT-LM (`.litertlm`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. El nombre LFM2.5 sugiere la segunda generación de la familia Liquid Foundation Models de LiquidAI, pero esta ficha no puede confirmar si emplea transformer denso, arquitectura híbrida con capas convolucionales o SSM, ni detalles sobre atención, tokenizador o posición de las capas. Tampoco hay datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si se aplicaron fases de RLHF o DPO.

Lo único verificable es el proceso de conversión: el artefacto original `LFM2.5-1.2B-Instruct_int8.litertlm` se publicó en litert-community y se ha replicado aquí sin modificaciones declaradas. La cuantización a int8 es la única transformación documentada y está orientada a reducir el tamaño y el consumo de memoria en dispositivos móviles.

## Capacidades

- Generación de texto e instrucciones: el nombre del modelo base indica un ajuste para seguir instrucciones, aunque no se detallan capacidades específicas.
- Ejecución en dispositivo: el formato LiteRT-LM está diseñado para inferencia local en Android y otros entornos compatibles con LiteRT.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Aplicaciones Android con IA local: integrar el artefacto `.litertlm` mediante el runtime LiteRT-LM para ofrecer generación de texto sin conexión y sin enviar datos a servidores.
- Asistentes de texto embebidos: usar el modelo como motor de respuestas en apps de notas, correo o productividad, aprovechando el tamaño reducido de un modelo de 1,2B parámetros cuantizado a int8.
- Reproducción del pipeline de Warped: servir como referencia para equipos que quieran replicar la conversión de modelos LiquidAI a LiteRT-LM y validar el proceso de empaquetado.
- Prototipado de funciones de lenguaje en móvil: evaluar latencia y calidad de un modelo de instrucciones pequeño antes de comprometerse con un modelo mayor o con inferencia en la nube.
- Distribución de artefactos para pruebas internas: al ser un espejo con trazabilidad al original, facilita fijar una versión concreta en pipelines de CI para apps Android.
- Investigación sobre modelos pequeños en dispositivo: analizar el comportamiento de un modelo de 1,2B parámetros cuantizado en hardware móvil, comparando con alternativas del mismo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 2,0 GB, lo que da una cota superior del espacio de almacenamiento necesario para los pesos.
- GPU recomendadas: no disponibles; el formato LiteRT-LM está orientado a aceleradores móviles (CPU, GPU o NPU del dispositivo) más que a GPU de escritorio.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: runtime LiteRT-LM; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warped-community/LFM2.5-1.2B-Instruct-litert-lm | 1,2B | no disponible | LiteRT-LM int8 | other | Hugging Face (espejo) |
| litert-community/LFM2.5-1.2B-Instruct | 1,2B | no disponible | LiteRT-LM int8 | other | Hugging Face (original) |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,2B | no disponible | no disponible | other | Hugging Face (modelo base) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con otras familias de modelos pequeños.

## Limitaciones y advertencias

- Es un espejo, no un modelo original: cualquier corrección o actualización debe buscarse en litert-community o en LiquidAI, no en este repositorio.
- La licencia es "other" y no se detallan sus términos en la información proporcionada; es imprescindible revisar la licencia del modelo base antes de un uso comercial.
- No hay información sobre sesgos, riesgo de alucinación ni evaluación de seguridad del modelo base.
- La cuantización int8 puede degradar la calidad respecto a los pesos originales en precisión completa; no se documenta el impacto.
- El formato LiteRT-LM limita el despliegue a entornos compatibles; no es directamente utilizable en servidores con vLLM o llama.cpp.
- El repositorio tiene 3 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy baja y escasa validación por parte de la comunidad.
- No se especifican idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/warped-community/LFM2.5-1.2B-Instruct-litert-lm
- Artefacto original: https://huggingface.co/litert-community/LFM2.5-1.2B-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
