# Tonic/Qwen3.5-08B-Wolof-Instruct-v1-ONNX

## Resumen

Qwen3.5-08B-Wolof-Instruct-v1-ONNX es una exportación al formato ONNX del modelo Tonic/Qwen3.5-08B-Wolof-Instruct-v1, un ajuste fino del modelo base Qwen3.5 de 8.000 millones de parámetros orientado a la instrucción en wolof. Lo publica el usuario Tonic bajo la etiqueta del proyecto GalsenAI, una iniciativa comunitaria de IA para lenguas de Senegal. El objetivo del modelo es proporcionar generación de texto conversacional en wolof, un idioma con recursos digitales escasos, y hacerlo ejecutable directamente en el navegador mediante Transformers.js y WebGPU.

La relevancia de esta versión concreta reside en su formato: al estar exportada a ONNX con cuantización q4f16, permite inferencia local en el cliente sin servidores dedicados, lo que reduce costes de despliegue y facilita aplicaciones web de bajo consumo. El repositorio ocupa 7,8 GB, coherente con un modelo de 8B cuantizado a 4 bits y pesos FP16 en algunas capas.

La información pública disponible es muy limitada: la model card apenas contiene una línea descriptiva, no se especifican licencia, idiomas soportados ni resultados de evaluación. Todo lo que sigue se basa en los metadatos de Hugging Face y en la naturaleza del modelo base (Qwen3.5), sin datos verificados sobre el ajuste fino en wolof.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parámetros totales | 8B (según el nombre del modelo; no confirmado en la model card) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4f16 (exportación ONNX para Transformers.js) |
| Idiomas soportados | wolof (objetivo del ajuste fino); lista oficial no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (repo de 7,8 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, con 8.000 millones de parámetros según la nomenclatura del repositorio. Se trata de un ajuste fino con instrucciones (Instruct) sobre el modelo base Qwen3.5, especializado en wolof. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable es la exportación a ONNX con cuantización q4f16, pensada para ejecución en WebGPU a través de Transformers.js. Esto permite desplegar el modelo en el navegador del usuario, con la consiguiente reducción de latencia de red y de costes de infraestructura. No hay detalles publicados sobre la estrategia de cuantización más allá del dtype indicado.

## Capacidades

- Generación de texto conversacional en wolof, orientada a instrucciones.
- Conversación multi-turno (tag `conversational`).
- Inferencia en navegador mediante Transformers.js y WebGPU.
- Ejecución local en el cliente sin necesidad de backend dedicado.
- Capacidades multilingües: no confirmadas; el ajuste fino se centra en wolof y no se documenta el comportamiento en otros idiomas.
- Tool calling, agentes, visión, audio o modo thinking: no disponible.

## Casos de uso

- Asistentes conversacionales en wolof dentro de aplicaciones web: el modelo puede gestionar diálogos multi-turno directamente en el navegador gracias a la exportación ONNX y WebGPU, sin depender de una API externa.
- Educación y alfabetización digital en Senegal: integración en plataformas de aprendizaje que necesiten respuestas en wolof, con despliegue de bajo coste al ejecutarse en el dispositivo del usuario.
- Atención al ciudadano en portales públicos: un chatbot en wolof que funcione offline o con conectividad intermitente, aprovechando la inferencia local.
- Prototipado rápido de aplicaciones de PLN para lenguas minorizadas: el formato ONNX facilita experimentar con el modelo en entornos JavaScript sin infraestructura de GPU dedicada.
- Investigación lingüística: generación y análisis de texto en wolof para corpus, traducción asistida o estudios de preservación lingüística.
- Demos y pruebas de concepto en el navegador: validar la calidad del ajuste fino en wolof antes de invertir en un despliegue con servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 7,8 GB en formato ONNX q4f16; la inferencia en WebGPU requiere memoria de GPU compartida con el navegador, típicamente varios GB.
- GPU recomendadas: no disponible; al ejecutarse vía WebGPU, depende de la GPU del cliente (integradas recientes o dedicadas).
- ¿Cabe en GPU de consumo? Previsiblemente sí en GPUs con suficiente memoria de vídeo o memoria unificada, pero no hay requisitos oficiales publicados.
- Opciones de despliegue: Transformers.js con WebGPU (dtype q4f16); otros runtimes ONNX no documentados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tonic/Qwen3.5-08B-Wolof-Instruct-v1-ONNX | 8B | no disponible | no disponible | ONNX (q4f16) | Ajuste fino en wolof, ejecución en navegador |
| Tonic/Qwen3.5-08B-Wolof-Instruct-v1 | 8B | no disponible | no disponible | safetensors (presumible) | Modelo base del que deriva esta exportación |
| Qwen3.5 (modelo base original) | 8B (variante) | no disponible | no disponible | no disponible | Modelo generalista sin ajuste en wolof |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un ajuste fino en wolof, puede heredar sesgos del corpus de entrenamiento y del modelo base Qwen3.5.
- Riesgo de alucinación inherente a los modelos generativos; no se ha evaluado su fiabilidad en dominios específicos.
- Cobertura idiomática limitada y no documentada: el rendimiento fuera del wolof es incierto.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de desplegarlo en producción.
- Longitud de contexto no especificada, lo que dificulta planificar aplicaciones con documentos largos.
- La cuantización q4f16 puede degradar la calidad respecto al modelo original en safetensors.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia comunitaria de su funcionamiento.
- La información de búsqueda web no contiene referencias verificables al proyecto GalsenAI ni al autor Tonic en el contexto de este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tonic/Qwen3.5-08B-Wolof-Instruct-v1-ONNX
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-08B-Wolof-Instruct-v1
