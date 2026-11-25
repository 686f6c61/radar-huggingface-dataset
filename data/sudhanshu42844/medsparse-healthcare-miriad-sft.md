# sudhanshu42844/medsparse-healthcare-miriad-sft

## Resumen

MedSparse Healthcare — MIRIAD Full-Parameter SFT es un modelo de lenguaje de 38.779.008 parámetros con arquitectura de mezcla de expertos dispersa (sparse MoE), inspirada en Mixtral pero desarrollada desde cero por el autor sudhanshu42844. No se trata de pesos oficiales de Mistral ni Mixtral, y tampoco es un checkpoint compatible con `AutoModelForCausalLM` de Transformers, lo que condiciona su integración en ecosistemas estándar. El modelo se ha entrenado específicamente para responder preguntas médicas de carácter educativo.

El modelo es el resultado de un linaje de tres etapas: preentrenamiento desde inicialización aleatoria sobre texto de dominio sanitario, un ajuste supervisado (SFT) médico sobre FreedomIntelligence/medical-o1-reasoning-SFT, y un ajuste fino final de todos los parámetros sobre el conjunto MIRIAD 5.8M (5.821.948 pares pregunta-respuesta). Esta última etapa se ejecutó en una única GPU de consumo, con precisión FP32 y 1.507.000 pasos de optimizador.

Su relevancia es fundamentalmente metodológica y de investigación: demuestra un pipeline completo de entrenamiento MoE desde cero en hardware asequible, pero el propio autor lo restringe a uso de investigación y advierte que su corrección médica y seguridad no están establecidas. Con 4 capas, tamaño oculto de 384 y ventana de 2.048 posiciones configuradas (entrenado a 192 tokens), es un modelo de escala muy reducida cuyas salidas tienden a ser breves y con errores factuales frecuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos dispersa (sparse MoE), inspirada en Mixtral; atención con grouped-query attention (6 cabezas de query, 2 de KV) |
| Parametros totales | 38.779.008 |
| Parametros activos | no disponible (4 expertos por bloque, enrutamiento top-2) |
| Longitud de contexto | 2.048 posiciones configuradas; entrenado a 192 tokens (entradas más largas no probadas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en FP32; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (pesos y código del repositorio) |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 4 capas, tamaño oculto de 384, vocabulario de 30.001 tokens y atención con grouped-query attention (6 cabezas de query frente a 2 de clave-valor). Cada bloque incorpora 4 expertos con enrutamiento top-2 y tamaño intermedio de experto de 768, con una pérdida de balanceo de carga de MoE añadida a la pérdida principal. El modelo no es compatible con las clases estándar de Transformers y requiere cargar sus pesos mediante el código del proyecto.

El entrenamiento consta de tres fases: preentrenamiento desde cero sobre texto sanitario, SFT médico sobre medical-o1-reasoning-SFT y un ajuste fino final de todos los parámetros sobre MIRIAD 5.8M con un optimizador AdamW nuevo. En esta última fase se usó pérdida de entropía cruzada solo sobre la respuesta (prompt enmascarado), longitud de secuencia de 192 tokens, batch de 1 con acumulación de gradiente de 4, learning rate 2e-05, weight decay 0.01 y 100 pasos de calentamiento, en FP32. Se procesaron 6.031.000 ejemplos y se truncaron 398.337 respuestas (6,6 %) para ajustarlas a 192 tokens. La mejor entropía cruzada de validación (64 ejemplos retenidos, solo respuesta) fue de 2,1897. El autor advierte que el reanudamiento con `skip()` sobre un flujo barajado provocó solapamiento: el contador de la época 0 llegó a 6.150.107 filas frente a las 5.821.948 de MIRIAD, por lo que no está verificado que se cubriera el conjunto completo, aunque el filtro de retención a nivel de artículo se aplicó a todas las filas.

## Capacidades

- Generación de texto en inglés orientada a preguntas y respuestas de temática médica educativa.
- Respuestas concisas y en formato de completado tras una plantilla de prompt con secciones `### System:`, `### User:` y `### Assistant:`.
- Razonamiento médico básico a nivel de dominio, limitado por el tamaño del modelo y la ventana de 192 tokens de entrenamiento.
- Enrutamiento disperso mediante MoE top-2 sobre 4 expertos por bloque.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Investigación sobre entrenamiento MoE desde cero: el modelo sirve como referencia reproducible de un pipeline completo (preentrenamiento, SFT y ajuste fino total) ejecutado en una GPU de consumo, útil para estudiar dinámicas de enrutamiento y balanceo de carga en modelos pequeños.
- Experimentos académicos de ajuste supervisado en dominio médico: permite analizar cómo el SFT sobre MIRIAD transforma un modelo que daba respuestas plantilla en uno que responde de forma temática, con métricas de perplejidad y solapamiento léxico documentadas.
- Generación de preguntas y respuestas sintéticas para preprocesamiento de datos: puede producir borradores de pares pregunta-respuesta sobre temas médicos que después se filtran y validan manualmente antes de usarse en otros pipelines.
- Docencia y demostraciones de arquitecturas MoE: su tamaño reducido (38,8 M de parámetros) permite desplegarlo en entornos docentes y visualizar el comportamiento de los expertos sin infraestructura dedicada.
- Pruebas de robustez y evaluación de alucinaciones: las respuestas erróneas documentadas por el autor (confusión de "stroke rate" con la enfermedad, tratamientos inventados, errores geográficos) lo convierten en un caso de estudio para diseñar detectores de alucinación en dominio sanitario.
- Prototipado de interfaces de pregunta-respuesta médica en entornos de investigación: con la plantilla de prompt documentada y decodificación greedy con penalización de repetición de 1,2, se puede integrar en cuadernos y scripts de experimentación, siempre con revisión humana de cada salida.

## Benchmarks y rendimiento

| Modelo | Perplejidad sobre respuestas de referencia (menor es mejor) | F1 de solapamiento de palabras (mayor es mejor) |
|---|---|---|
| MedSparse (MIRIAD SFT) | 9,50 | 0,346 |
| Antes de MIRIAD (etapa 2) | 383,49 | 0,185 |

La evaluación se realizó sobre 15 preguntas de 15 artículos retenidos distintos (una por pregunta), con decodificación greedy y penalización de repetición de 1,2. La perplejidad se mide sobre las respuestas de referencia de MIRIAD y el solapamiento de palabras es una métrica léxica aproximada, no una medida de corrección médica; el autor las describe como comprobaciones de desarrollo, no como un benchmark clínico. En la lectura informal de las 15 respuestas, aproximadamente 3 fueron correctas o mayoritariamente correctas, 5 fueron pertinentes pero vagas o incompletas y 7 fueron erróneas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 38,8 M de parámetros en FP32 los pesos ocupan aproximadamente 155 MB, y en FP16 alrededor de 78 MB, por lo que el modelo cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una única GPU de consumo. Cualquier GPU con al menos 1-2 GB de VRAM libre debería bastar para inferencia.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para pruebas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo no es un checkpoint de `AutoModelForCausalLM` y requiere el código del proyecto (`load_model.py`) con torch, safetensors, tokenizers y huggingface_hub.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MedSparse Healthcare — MIRIAD SFT | 38,8 M | 2.048 configurados (192 entrenados) | Apache 2.0 | Hugging Face, código en GitHub | MoE sparse custom, no compatible con Transformers estándar |
| Modelos médicos pequeños basados en transformers (p. ej. variantes de <100 M) | no disponible | no disponible | variable | Hugging Face | No se dispone de datos verificados en la información proporcionada para una comparación numérica |
| Alternativas MoE de referencia (Mixtral) | no disponible en esta ficha | no disponible | no disponible | no disponible | El autor indica explícitamente que no son pesos oficiales de Mistral/Mixtral |

No se dispone de datos verificados de modelos comparables de la misma categoría en la información proporcionada; la comparación numérica de rendimiento, contexto y disponibilidad con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- Modelo de 38,8 M de parámetros: se esperan errores factuales, omisiones y alucinaciones con alta confianza.
- Entrenado con ventanas de 192 tokens y respuestas truncadas en el 6,6 % de los casos, por lo que las salidas tienden a ser cortas.
- Las respuestas de MIRIAD fueron generadas por modelos de lenguaje a partir de artículos de investigación y pueden contener errores propios.
- No se ha realizado ninguna evaluación de seguridad clínica, equidad, robustez, privacidad ni seguridad de medicación.
- El autor lo restringe a uso de investigación: no debe emplearse para diagnóstico, tratamiento, triaje, dosificación de medicamentos ni ninguna decisión sobre personas reales.
- Cobertura de datos no verificada: el solapamiento por reanudación con `skip()` implica que algunas filas de MIRIAD pueden no haberse visto nunca y otras repetirse.
- Solo soporta inglés; no se documentan capacidades multilingües.
- No es un checkpoint de `AutoModelForCausalLM`: requiere el código del proyecto para cargar y ejecutar.
- La licencia Apache 2.0 cubre pesos y código del repositorio, pero los datos de entrenamiento (MIRIAD) tienen su propia atribución y condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudhanshu42844/medsparse-healthcare-miriad-sft
- Modelo base (etapa 2): https://huggingface.co/sudhanshu42844/medsparse-healthcare-medical-sft
- Dataset MIRIAD: https://huggingface.co/datasets/miriad/miriad-5.8M
- Paper de MIRIAD: https://arxiv.org/abs/2506.06091
- Proyecto (página del laboratorio): https://su394611-del.github.io/MedSparse-Healthcare-LLM-From-Scratch/
- Código fuente: https://github.com/su394611-del/MedSparse-Healthcare-LLM-From-Scratch
