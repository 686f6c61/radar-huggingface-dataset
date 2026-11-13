# Tonic/Qwen3.5-4B-Wolof-Instruct-v1-ONNX

## Resumen

Qwen3.5-4B-Wolof-Instruct-v1-ONNX es la exportación a formato ONNX del modelo Tonic/Qwen3.5-4B-Wolof-Instruct-v1, un ajuste fino orientado a instrucciones en wolof (idioma hablado principalmente en Senegal) sobre una base de la familia Qwen3.5 con 4.000 millones de parámetros. El autor identificado en Hugging Face es Tonic, y el artefacto está pensado específicamente para ejecutarse en el navegador mediante Transformers.js con aceleración WebGPU, usando cuantización de 4 bits con pesos en coma flotante de 16 bits (`dtype: "q4f16"`).

El problema que resuelve es la distribución de un modelo conversacional en wolof sin necesidad de infraestructura de servidor: al estar exportado a ONNX y empaquetado para Transformers.js, puede cargarse directamente en una página web o aplicación JavaScript y ejecutarse en la GPU del cliente. Esto es relevante para escenarios de baja conectividad o de privacidad, habituales en proyectos de tecnología lingüística para lenguas de bajos recursos como el wolof.

La ficha se basa únicamente en los metadatos públicos del repositorio. No hay model card detallada, ni información sobre licencia, idiomas declarados, composición del dataset de ajuste ni resultados de benchmarks. El repositorio ocupa 19,5 GB, lo que refleja la presencia de múltiples variantes de exportación ONNX además de los pesos base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; tag `qwen3_5_text`) |
| Parámetros totales | 4.000 millones (según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4f16 (4 bits con activaciones/pesos en fp16) para WebGPU; el repo incluye otras variantes ONNX no documentadas |
| Idiomas soportados | wolof (objetivo del ajuste); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportación para Transformers.js); el modelo base está en safetensors |
| Tamaño del repositorio | 19,5 GB |
| Librería de despliegue | transformers.js |
| Pipeline | text-generation |
| Modelo base | Tonic/Qwen3.5-4B-Wolof-Instruct-v1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5, con 4.000 millones de parámetros, según se deduce del nombre del modelo y del tag `qwen3_5_text`. No se dispone de información pública sobre el número de capas, dimensión oculta, cabezas de atención ni longitud de contexto nativa. Tampoco se documenta si el modelo base incorpora innovaciones como atención lineal, decodificación especulativa o modos de razonamiento extendido.

El ajuste fino se realizó sobre el modelo Tonic/Qwen3.5-4B-Wolof-Instruct-v1, del que no se detalla la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. La única información técnica concreta es la exportación a ONNX con cuantización `q4f16` para Transformers.js WebGPU, que implica una reducción de precisión a 4 bits en los pesos para permitir la inferencia en navegador.

## Capacidades

- Generación de texto conversacional en wolof, orientada a instrucciones (sufijo `Instruct`).
- Ejecución en navegador mediante Transformers.js y WebGPU, sin backend de servidor.
- Cuantización q4f16 que reduce el uso de memoria frente a los pesos originales en fp16.
- Capacidades multilingües: solo se declara el wolof como objetivo; el resto no está documentado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente conversacional en wolof dentro de una aplicación web: el modelo se carga con Transformers.js y WebGPU y responde en el cliente, sin enviar datos a un servidor, lo que es adecuado para usuarios con conectividad limitada.
- Herramientas educativas offline: una aplicación web progresiva puede empaquetar el ONNX y ofrecer práctica de conversación en wolof en escuelas con infraestructura de red escasa.
- Traducción asistida wolof-francés en el navegador: el modelo puede integrarse en un editor web para sugerir reformulaciones, siempre que se valide la calidad del ajuste en tareas de traducción.
- Prototipado rápido de productos de PLN para lenguas de bajos recursos: el formato ONNX y la integración con Transformers.js permiten iterar en JavaScript sin montar un stack de Python.
- Atención al ciudadano en portales públicos senegaleses: un chatbot embebido puede resolver consultas frecuentes en wolof y derivar al usuario a formularios, reduciendo la dependencia de personal bilingüe.
- Investigación en lingüística computacional: el modelo sirve como línea base reproducible para evaluar instrucciones en wolof y comparar con otros ajustes de la misma familia.
- Demos y pruebas de concepto en WebGPU: útil para validar latencia y viabilidad de modelos de 4B en hardware de cliente antes de invertir en despliegue servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización q4f16, los pesos de 4B rondan los 2-2,5 GB; el repositorio completo de 19,5 GB incluye varias exportaciones y no debe confundirse con el peso en memoria de una sola variante.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable en navegador (por ejemplo, Apple Silicon, GPUs integradas recientes y dedicadas de gama media); para servidor, A100 o H100 no son necesarias dado el tamaño, pero pueden usarse con ONNX Runtime.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 4-6 GB de VRAM o memoria unificada, aunque la cifra exacta no está documentada.
- Opciones de despliegue: Transformers.js con WebGPU (objetivo principal), ONNX Runtime (web, Node.js o nativo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Tonic/Qwen3.5-4B-Wolof-Instruct-v1-ONNX | 4B | no disponible | ONNX (q4f16) | no disponible | Exportación para navegador |
| Tonic/Qwen3.5-4B-Wolof-Instruct-v1 | 4B | no disponible | safetensors | no disponible | Modelo base del que deriva esta exportación |
| Otros ajustes Qwen3.5 de 4B | 4B | no disponible | safetensors / GGUF | variable | No se dispone de datos verificables en la búsqueda realizada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No hay model card detallada: se desconocen la licencia, los idiomas declarados oficialmente y las condiciones de uso comercial.
- El ajuste se centra en wolof; el rendimiento en castellano, inglés u otros idiomas no está documentado y podría degradarse.
- Riesgo de alucinación inherente a los modelos de 4B ajustados con instrucciones, sin datos de evaluación que lo cuantifiquen.
- La cuantización q4f16 introduce pérdida de precisión respecto al modelo base en safetensors; conviene validar la calidad antes de producción.
- El tamaño del repositorio (19,5 GB) implica que la descarga completa no es viable en muchos entornos web; debe seleccionarse la variante ONNX concreta.
- La ejecución en navegador depende de la disponibilidad y estabilidad de WebGPU, que varía según navegador y sistema operativo.
- No se documentan sesgos conocidos ni medidas de mitigación.
- El autor "Tonic" no presenta un perfil verificable en la información disponible; los resultados de búsqueda web sobre "Tonic" corresponden a entidades no relacionadas (aplicación médica, agua tónica, centro de neuroimagen) y no deben asociarse a este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tonic/Qwen3.5-4B-Wolof-Instruct-v1-ONNX
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-4B-Wolof-Instruct-v1
- Transformers.js: https://github.com/huggingface/transformers.js
- Documentación de WebGPU: https://developer.mozilla.org/es/docs/Web/API/WebGPU_API
