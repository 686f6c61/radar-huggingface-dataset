# trentzap/QTensor-TinyLlama-1.1B-Asymmetric-v2

## Resumen

QTensor TinyLlama 1.1B Asymmetric v2 es un modelo de lenguaje compacto desarrollado por trentzap, diseñado como una variante totalmente comprimida de `TinyLlama/TinyLlama-1.1B-Chat-v1.0`. Su objetivo principal es reducir drásticamente el consumo de VRAM en inferencia —de aproximadamente 4,4 GB a 1.162 MB— manteniendo una coherencia generativa aceptable para un modelo de su tamaño. Para lograrlo, emplea una arquitectura asimétrica híbrida que combina descomposición SVD con asignación dinámica de rango basada en entropía de Shannon, cuantización INT4 protegida por AWQ en las capas MLP y un mecanismo de destilación de conocimiento con pérdida enmascarada.

El modelo se entrenó durante 10.000 pasos de destilación consciente de la cuantización (QAD) contra el profesor FP16, utilizando el dataset Alpaca de 52K instrucciones. Con 736 millones de parámetros totales y licencia MIT, está orientado a despliegues en entornos con recursos limitados, como GPUs de consumo o inferencia en el borde. Su relevancia actual radica en explorar técnicas de compresión extrema que permitan ejecutar modelos conversacionales en hardware modesto sin recurrir a servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama) con compresion asimetrica: Block-SVD + SpLoRA en atencion, INT4 AWQ + LoRA en MLP |
| Parametros totales | 736.440.376 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 AWQ (MLP), SVD con rango dinamico r ∈ [8, 32] (atencion) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de QTensor TinyLlama 1.1B Asymmetric v2 se basa en el transformer original de TinyLlama, pero con una topologia de compresion hibrida de tres niveles. En las proyecciones de atencion (`q/k/v/o_proj`) se aplica Block-SVD combinado con SpLoRA, donde el rango de cada capa se asigna dinamicamente mediante un asignador de rango basado en entropia de Shannon: las capas con baja entropia estructural usan rango 8, mientras que las capas con alta densidad de informacion expanden hasta rango 32. En las capas MLP (`gate/up/down_proj`) se emplea cuantizacion INT4 con escalas de activacion por canal protegidas por AWQ, aplicando la correccion matematica en la identidad de cuantizacion: los pesos se empaquetan como `INT4(W / S)` y las activaciones se escalan como `X × S` en el paso forward. Ademas, un puente de subespacio aprendible alinea los estados ocultos del estudiante con el manifold del profesor.

El entrenamiento consistio en 10.000 pasos de destilacion consciente de la cuantizacion (QAD) contra el profesor FP16, con una funcion de perdida combinada de divergencia KL (temperatura T=2) y error cuadratico medio (MSE) sobre capas ancla (4, 8, 12, 16, 20 y 22). Los tokens de padding se enmascaran en el calculo de la perdida para garantizar convergencia semantica real. El dataset de entrenamiento fue `tatsu-lab/alpaca` (52K instrucciones, ciclado), con batch efectivo de 32, tasa de aprendizaje 2e-4 con programacion CosineAnnealing y hardware NVIDIA RTX 5080 16GB. El kernel Triton vectorizado para INT4 con carga de tiles `BLOCK_K=64` evita el derrame de registros y logra el doble de rendimiento frente a implementaciones escalares ingenuas.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat compatible con TinyLlama.
- Razonamiento basico y respuesta a instrucciones, heredado del dataset Alpaca.
- Coherencia generativa verificada sin bucles de repeticion, segun las pruebas del autor.
- Inferencia con requisitos de VRAM muy reducidos (1.162 MB), apta para GPUs de consumo.
- Compatible con el ecosistema Transformers mediante `trust_remote_code=True`.
- Soporte de cuantizacion INT4 con escalas AWQ para proteccion de canales salientes.
- No soporta tool calling, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Chatbots locales en hardware modesto: el modelo puede ejecutarse en GPUs con tan solo 2 GB de VRAM, lo que permite desplegar asistentes conversacionales en portatiles o mini-PCs sin conexion a la nube.
- Prototipado rapido de aplicaciones de texto: su compatibilidad con Transformers y su tamano reducido facilitan iterar sobre pipelines de generacion de texto en entornos de desarrollo sin infraestructura costosa.
- Educacion e investigacion en compresion de modelos: la arquitectura asimetrica con SVD basado en entropia y AWQ INT4 sirve como caso de estudio para tecnicas de cuantizacion extrema y destilacion.
- Generacion de contenido asistida en ingles: redaccion de borradores, resumenes o respuestas a preguntas frecuentes en aplicaciones donde el presupuesto de memoria es critico.
- Inferencia en el borde (edge computing): su huella de memoria de aproximadamente 1,1 GB lo hace viable para dispositivos embebidos con aceleradores GPU limitados.
- Evaluacion de tecnicas de destilacion con perdida enmascarada: investigadores pueden reproducir el entrenamiento QAD y comparar la convergencia semantica frente a metodos de destilacion convencionales.

## Benchmarks y rendimiento

El autor publico los siguientes resultados verificados en NVIDIA RTX 5080 con CUDA 13.2:

| Metrica | FP16 Baseline | QTensor Asymmetric v2 |
|---|---|---|
| VRAM (inferencia) | ~4,4 GB | 1.162 MB |
| Throughput | ~80 t/s | 58,8 t/s |
| WikiText word perplexity | ~11 | 93,65 |
| HellaSwag (200 muestras) | 50,1% | 40,0% |
| Perdida de entrenamiento QAD | — | 2,2264 |

El autor indica que la perplexity de 93,65 representa una mejora del 44% frente al baseline de rango plano (168,46), y que la cuantizacion INT4 de las capas MLP introduce un cuello de botella informacional que limita la perplexity minima teorica para esta profundidad de compresion. No se han publicado resultados en benchmarks estandar como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: 1.162 MB en FP16/BF16 con el kernel Triton vectorizado.
- GPU recomendada: NVIDIA RTX 5080 (usada por el autor), aunque cualquier GPU con al menos 2 GB de VRAM y soporte CUDA deberia ser suficiente.
- Cabe en GPUs de consumo: si, incluyendo RTX 3060, RTX 4060, RTX 4070 y similares.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; el autor menciona compatibilidad con endpoints y el ecosistema Hugging Face.
- Throughput estimado: 58,8 tokens por segundo en RTX 5080, frente a ~80 t/s del baseline FP16.
- No se dispone de datos sobre despliegue con vLLM, llama.cpp u Ollama en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | VRAM inferencia | Perplexity (WikiText) |
|---|---|---|---|---|---|
| QTensor TinyLlama 1.1B Asymmetric v2 | 736M | No disponible | MIT | 1.162 MB | 93,65 |
| TinyLlama-1.1B-Chat-v1.0 (FP16) | 1,1B | 2.048 (heredado de Llama 2) | MIT | ~4,4 GB | ~11 |
| QTensor TinyLlama 1.1B Alpha | No disponible | No disponible | MIT | No disponible | No disponible |

La comparativa directa con el modelo original TinyLlama muestra una reduccion de VRAM del 74% a costa de un aumento significativo de perplexity (de ~11 a 93,65) y una caida de 10 puntos porcentuales en HellaSwag. La variante Alpha del mismo autor existe pero no se dispone de datos publicados para comparar. No se han identificado otros modelos comparables con la misma combinacion de SVD + AWQ INT4 en el momento de la busqueda.

## Limitaciones y advertencias

- La perplexity de 93,65 en WikiText es sustancialmente superior a la del modelo original FP16 (~11), lo que indica una degradacion notable en la modelizacion del lenguaje.
- El rendimiento en HellaSwag cae del 50,1% al 40,0%, lo que sugiere una perdida de capacidad de razonamiento de sentido comun.
- El modelo solo soporta ingles; no hay datos sobre rendimiento en otros idiomas.
- La longitud de contexto no esta documentada; se hereda presumiblemente de TinyLlama (2.048 tokens), pero no se confirma en la model card.
- El autor advierte que la cuantizacion INT4 de las capas MLP introduce un cuello de botella informacional que limita la perplexity minima alcanzable.
- El codigo requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto no auditado por Hugging Face.
- No se han publicado evaluaciones en benchmarks estandar (MMLU, GSM8K, HumanEval), lo que dificulta una valoracion objetiva de sus capacidades.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion muy limitada o un proyecto reciente.
- La fecha de creacion (2026-08-15) es posterior a la fecha de corte de conocimiento del asistente; los datos deben verificarse con fuentes actualizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trentzap/QTensor-TinyLlama-1.1B-Asymmetric-v2
- Repositorio GitHub del motor QTensor: https://github.com/Trentzap1/qtensor-engine
- Sitio web del proyecto: https://qtensor.com.au
- Variante Alpha: https://huggingface.co/trentzap/QTensor-TinyLlama-1.1B-Alpha
- Variante hibrida v2: https://huggingface.co/trentzap/qtensor-tinyllama-hybrid-v2
- Repositorio de TinyLlama-1.1B-Chat-v1.0 (modelo base): https://github.com/inferless/tinyllama-1-1b-chat-v1-0
