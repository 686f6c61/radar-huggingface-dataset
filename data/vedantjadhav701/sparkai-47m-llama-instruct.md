# vedantjadhav701/SparkAI-47m-llama-instruct

## Resumen

SparkAI-47M-Llama-Instruct es un modelo de lenguaje de pequeño tamaño (47,7 millones de parámetros) desarrollado por Vedant Jadhav, estudiante de ingeniería en IA y ML. Se trata de un checkpoint afinado con instrucciones (SFT) a partir del modelo base SparkAI-47M-Llama, que fue preentrenado con 10 mil millones de tokens procedentes de FineWeb-Edu y Cosmopedia-v2. Su principal atractivo es su huella de memoria extremadamente baja (aproximadamente 95,4 MB en FP32), lo que lo hace apto para dispositivos de borde, aplicaciones móviles, WebGPU y microcontroladores.

El modelo adopta una arquitectura moderna tipo LLaMA 3, con atención por grupos de consultas (GQA), activaciones SwiGLU, codificación posicional rotatoria (RoPE) y normalización RMSNorm. Aunque su capacidad es limitada por su tamaño, el autor documenta un fenómeno de saturación de capacidad tras 3,77 mil millones de tokens, lo que sugiere que el modelo ha alcanzado su límite representacional. Está disponible bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA 3 (GQA, SwiGLU, RoPE, RMSNorm) |
| Parametros totales | 47.718.912 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (pesos en FP32; se pueden cuantizar con herramientas externas) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas, con tamaño oculto de 512, 8 cabezas de atencion de consulta y 2 cabezas de clave/valor (GQA), lo que reduce el coste computacional frente a la atencion multi-cabeza clasica. La capa MLP usa activacion SwiGLU con dimension intermedia de 1408. Las embeddings estan atadas (tied embeddings) y no hay terminos de sesgo. El vocabulario es de 49.152 tokens, utilizando el tokenizador de SmolLM2 con plantilla de chat ChatML.

El preentrenamiento se realizo sobre 10.000 millones de tokens, mezclando FineWeb-Edu (85%) y Cosmopedia-v2 (15%), con un optimizador AdamW y programacion de tasa de aprendizaje coseno con calentamiento. El hardware utilizado fue una NVIDIA A100 de 80 GB. La perplejidad final de evaluacion fue de 31,46, aunque se observo una meseta a partir de los 3,77 mil millones de tokens (perplejidad de 31,30), lo que indica que el modelo ha saturado su capacidad representativa. Posteriormente, se realizo un afinamiento supervisado (SFT) con formato ChatML para seguir instrucciones y mantener conversaciones.

## Capacidades

- Generacion de texto y respuesta a instrucciones en ingles.
- Soporte de formato de chat ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento basico y respuestas a preguntas sencillas, limitado por su tamano.
- Capacidad de ejecucion en entornos con recursos muy limitados (menos de 100 MB de RAM).
- No soporta tool calling, funciones ni razonamiento multi-paso avanzado.
- No tiene capacidades multimodales (vision, audio, etc.).
- Solo opera en ingles; no hay soporte multilingue.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el modelo puede integrarse en aplicaciones moviles o sistemas embebidos para mantener dialogos cortos de atencion al cliente o preguntas frecuentes, gracias a su bajo consumo de memoria (95,4 MB) y su formato ChatML.
- Clasificacion y etiquetado de texto: dado su tamano reducido, puede emplearse para clasificar documentos cortos o correos electronicos en categorias predefinidas, ejecutandose en CPU sin necesidad de GPU.
- Generacion de respuestas automaticas en sistemas de soporte por correo: con una ventana de contexto de 1024 tokens, puede redactar respuestas breves a consultas simples de usuarios, integrado en pipelines de automatizacion.
- Prototipado rapido de aplicaciones de IA: al ser un modelo pequeno y de facil descarga (0,1 GB), es util para validar flujos de trabajo con transformers antes de escalar a modelos mayores.
- Educacion e investigacion en modelos de lenguaje: sirve como banco de pruebas para estudiar la saturacion de capacidad en modelos sub-50M, tal como documenta el autor, o para experimentos de cuantizacion y destilacion.
- Chatbots de demostracion en entornos web (WebGPU): su peso reducido permite cargarlo directamente en el navegador mediante WebGPU, habilitando asistentes locales sin servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la perplejidad de evaluacion durante el preentrenamiento:

| Etapa de preentrenamiento | Perplejidad |
|---|---|
| 630M tokens | 43,49 |
| 3,77B tokens | 31,30 |
| 10,00B tokens | 31,46 |

La perplejidad se estabilizo entre 3,77B y 10B tokens, lo que sugiere que el modelo ha alcanzado su capacidad maxima con esos datos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 95,4 MB en FP32 (47,7M parametros x 4 bytes). Con cuantizacion a 8 bits se reduce a unos 48 MB, y a 4 bits a unos 24 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) y en tarjetas integradas.
- Opciones de despliegue: compatible con Hugging Face transformers, text-generation-inference (TGI) y endpoints compatibles. Tambien puede ejecutarse con llama.cpp u Ollama si se convierte a formato GGUF, aunque no se proporciona oficialmente.
- Latencia y throughput: no se dispone de datos medidos. Dado su tamano, se espera una latencia muy baja (del orden de milisegundos por token en GPU) y alto throughput incluso en CPU.

## Comparativa con modelos similares

El propio autor compara SparkAI-47M con modelos tipicos sub-50M, destacando su mayor presupuesto de tokens (10B frente a 1-2B) y su arquitectura moderna. No se dispone de benchmarks comparativos publicados. Como referencia, se pueden considerar modelos de tamano similar:

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| SparkAI-47M-Llama-Instruct | 47,7M | 1024 | LLaMA 3 (GQA, SwiGLU) | Apache 2.0 |
| SmolLM2-135M | 135M | 2048 | LLaMA 3 | Apache 2.0 |
| TinyLlama-1.1B | 1,1B | 2048 | LLaMA 2 | Apache 2.0 |

SparkAI-47M es significativamente mas pequeno que estas alternativas, por lo que su rendimiento en tareas complejas sera inferior, pero su ventaja reside en el despliegue en entornos con restricciones extremas de memoria.

## Limitaciones y advertencias

- Sesgos: al entrenarse con datos de FineWeb-Edu y Cosmopedia-v2, puede heredar sesgos presentes en esos corpus, aunque no se han documentado evaluaciones especificas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto: la ventana de 1024 tokens es corta; no es adecuado para tareas que requieran contexto largo o documentos extensos.
- Idioma: solo ingles; no soporta otros idiomas.
- Capacidad limitada: con solo 47,7M de parametros, su rendimiento en razonamiento complejo, matematicas o codigo es muy limitado. No debe usarse en produccion para tareas que requieran precision alta.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre el comportamiento del modelo.
- Saturacion documentada: el propio autor indica que el modelo ha saturado su capacidad; entrenar mas no mejorara el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vedantjadhav701/SparkAI-47m-llama-instruct
- Modelo base (preentrenado): https://huggingface.co/vedantjadhav701/SparkAI-47m-llama-10b-token
- Repositorio GitHub (SparkAI): https://github.com/VedantJadhav701/SparkAI
- Perfil del autor en GitHub: https://github.com/VedantJadhav701/
- Modelo relacionado SparkAI-50M-Instruct: https://huggingface.co/vedantjadhav701/SparkAI-50M-Instruct
- Modelo relacionado SparkAI-50M: https://huggingface.co/vedantjadhav701/SparkAI-50M
