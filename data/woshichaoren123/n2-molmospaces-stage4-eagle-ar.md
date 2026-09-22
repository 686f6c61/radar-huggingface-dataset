# woshichaoren123/n2-molmospaces-stage4-eagle-ar

## Resumen

n2-molmospaces-stage4-eagle-ar es una política robótica de tipo vision-language-action (VLA) publicada por el usuario de Hugging Face woshichaoren123, correspondiente a la etapa 4 (stage-4) de la familia GR00T N2. Está especializada en las tareas Franka pick, pick-and-place y open del simulador MolmoSpaces. El modelo no es un modelo de lenguaje conversacional: es un módulo de control que genera acciones motoras denoised a partir de observaciones visuales y de un plan textual estructurado.

Técnicamente combina dos componentes. Por un lado, un transformer de difusión Cosmos-Predict2.5 de 2B parámetros que realiza denoising conjunto de vídeo y acciones, apoyado en un VAE Wan2.2. Por otro, un codificador de texto Eagle-Embodied 4B congelado (`text_encoder`) que produce los estados ocultos usados como contexto de cross-attention: una frase de subtarea más 10 waypoints con coordenadas 2D y 3D. El checkpoint suma 8.303.691.556 parámetros según safetensors y ocupa 16,7 GB en el repositorio.

Su relevancia es de nicho pero alta para investigación en robótica: es un ejemplo reproducible de arquitectura híbrida que acopla un planificador de waypoints (Eagle-Embodied) a un difusor de acciones (Cosmos), con re-planificación cada 3 chunks de acción. El checkpoint corresponde al paso 100.000 del entrenamiento y solo incluye ficheros de inferencia, sin estados del optimizador. No hay métricas de rendimiento publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion Cosmos-Predict2.5 (2B) para denoising de video y acciones, con VAE Wan2.2 y cross-attention sobre los estados ocultos de un codificador de texto Eagle-Embodied 4B congelado |
| Parametros totales | 8.303.691.556 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye unicamente pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas acopladas. El planificador es un Eagle-Embodied 4B que genera una respuesta compuesta por una frase de subtarea y 10 waypoints con coordenadas 2D y 3D. Ese modelo permanece congelado y se distribuye dentro del checkpoint bajo la clave `text_encoder`. Sus estados ocultos alimentan la cross-attention de un transformer de difusión Cosmos-Predict2.5 de 2B parámetros, que aplica denoising simultáneo sobre vídeo y sobre la secuencia de acciones, empleando un VAE Wan2.2 para el espacio latente visual. Los 8,3B parámetros totales corresponden a la suma del difusor, el codificador de texto congelado y los componentes auxiliares.

El entrenamiento se realizó con planes generados en modo autoregresivo greedy con lotes de 16, siguiendo la receta de Eagle `atomic_2d3d_4b_ar`, con destino `woshichaoren123/Eagle-Embodied-4B-Robotics-2D3D-AR` y drafter `woshichaoren123/Eagle-Embodied-4B-Robotics-2D3D-DFlash`. La re-planificación se ejecuta cada 3 chunks de acción. El run se identifica como `TRAJ-stage4-eagle-question_answer-full-fh5s-k10-vfull-eagleplan-subtask_eagle-notrajenc-ar4b-replan3-from_vo_200k-bs4x4-lr1e-4` (rama `qa_ar4b_r3`) y el checkpoint liberado es el paso 100.000. No se documentan en la información disponible el volumen de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO, algo poco habitual en políticas de control motor.

## Capacidades

- Generación de acciones motoras para un brazo Franka en las tareas pick, pick-and-place y open del simulador MolmoSpaces.
- Denoising conjunto de vídeo y acciones dentro del mismo transformer de difusión, lo que permite modelar la dinámica visual esperada junto con la trayectoria.
- Consumo de planes estructurados: una frase de subtarea más 10 waypoints con coordenadas 2D y 3D, codificados por el Eagle-Embodied 4B congelado.
- Re-planificación periódica cada 3 chunks de acción, lo que introduce un bucle de planificación y ejecución dentro de un mismo episodio.
- Ejecución de tareas de manipulación de un solo brazo con objetivos de tipo pick, pick-and-place y open.
- Integración en el benchmark de velocidad N2 a través del repositorio `eagle-molmospace-speed`, que documenta el código de carga, el entorno conda y las cifras medidas.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión generalista, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación pick-and-place en laboratorio con un brazo Franka: la política recibe observaciones visuales y un plan de subtarea con waypoints, y emite chunks de acción que el controlador del robot ejecuta. Es adecuada porque el entrenamiento está específicamente restringido al entorno MolmoSpaces Franka.
- Evaluación comparativa de recetas de planificación: dado que la model card advierte que usar un decodificador distinto al de entrenamiento desplaza los planes unos 3,7 cm, el checkpoint sirve para medir experimentalmente el impacto del cambio de decodificador sobre la política.
- Investigación en acoplamiento planificador-difusor: permite estudiar cómo influyen los estados ocultos de un modelo Eagle-Embodied congelado en la cross-attention de un difusor Cosmos, sin necesidad de entrenar el codificador de texto.
- Reproducción del benchmark de velocidad N2: el repositorio `eagle-molmospace-speed` incluye el código de carga y el entorno conda, por lo que el caso de uso directo es medir latencia y throughput de esta política en el hardware disponible.
- Punto de partida para fine-tuning posterior: al distribuirse solo ficheros de inferencia (pesos, configuraciones y estadísticas), sirve como inicialización para reentrenar la cabeza de acciones en tareas próximas dentro del mismo simulador.
- Estudio de re-planificación a distintas frecuencias: el modelo está entrenado con re-planificación cada 3 chunks, de modo que es un banco de pruebas para analizar la sensibilidad de la política a ese hiperparámetro.
- Validación de pipelines de decodificación especulativa en robótica: la referencia explícita al drafter Eagle-Embodied-4B-Robotics-2D3D-DFlash lo convierte en un caso práctico para evaluar decodificación asistida en un bucle de control.
- Docencia y divulgación técnica: como ejemplo autocontenido de VLA híbrido con licencia `other`, resulta útil para explicar la separación entre planificación semántica y generación de acciones por difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el checkpoint se utilizó en el N2 speed benchmark (repositorio `eagle-molmospace-speed`), pero no se incluyen en la información proporcionada cifras de latencia, throughput ni tasas de éxito en las tareas de MolmoSpaces.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 8,3B parámetros suponen aproximadamente 16,6 GB solo en pesos; en FP32, unos 33 GB. A esa cifra hay que sumar el VAE Wan2.2, el codificador de texto y las activaciones del bucle de difusión. La estimación es aritmética a partir del recuento de parámetros, no una cifra publicada por el autor.
- GPU recomendadas: por encima de 24 GB de VRAM para BF16 con margen suficiente. Encajan A100 (40 GB o 80 GB), H100 y tarjetas profesionales de 48 GB o más.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB está en el límite ajustado para BF16; se requeriría gestión cuidadosa de memoria y offloading. En cuantizaciones de 8 bits o 4 bits cabría con más holgura, pero no se distribuyen pesos cuantizados en el repositorio.
- Opciones de despliegue: la librería declarada es `cosmos`, y el repositorio `eagle-molmospace-speed` documenta el código de carga y el entorno conda necesario. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible, algo esperable dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye métricas ni especificaciones de políticas alternativas (por ejemplo, otras etapas de GR00T N2 u otras recetas de Eagle-Embodied) que permitan una comparación cuantitativa. Lo único verificable es que el checkpoint pertenece a la familia GR00T N2 y que la model card lo sitúa como etapa 4 de un run concreto, sin datos comparativos publicados.

## Limitaciones y advertencias

- Dependencia estricta del decodificador de planes: la model card advierte que en inferencia debe servirse la misma receta con la que se entrenó y que otro decodificador produce planes a unos 3,7 cm de distancia de lo visto en entrenamiento, de forma silenciosa. Es un fallo difícil de detectar porque no genera error explícito.
- Dominio muy restringido: solo cubre las tareas Franka pick, pick-and-place y open del simulador MolmoSpaces. No hay evidencia de transferencia a robots físicos ni a otros entornos.
- No es un modelo conversacional: no se documentan capacidades de generación de texto libre, razonamiento general, código, matemáticas ni tool calling.
- Idiomas: no disponibles. La información no especifica qué lenguas soporta el codificador Eagle-Embodied ni si el plan textual admite instrucciones en varios idiomas.
- Longitud de contexto: no disponible. Al tratarse de un bucle de control con re-planificación cada 3 chunks, la ventana efectiva de condicionamiento no está documentada.
- Sesgos conocidos: no disponibles. No hay análisis de sesgo ni evaluación de robustez frente a variaciones de iluminación, oclusión o distribución de objetos.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de generar planes o waypoints incoherentes con la escena cuando la entrada se aleja de la distribución de entrenamiento.
- Licencia: marcada como `other`. Es imprescindible revisar los términos completos antes de cualquier uso comercial, ya que la etiqueta no concreta permisos ni restricciones y puede heredar condiciones de los componentes subyacentes (Cosmos, Wan2.2, Eagle-Embodied).
- Repositorio sin adopción: cero descargas y cero likes en el momento de la consulta, sin garantía de mantenimiento ni de soporte por parte del autor.
- Solo ficheros de inferencia: los estados del optimizador no se incluyen, por lo que no es posible reanudar el entrenamiento original tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/woshichaoren123/n2-molmospaces-stage4-eagle-ar
- Modelo destino de la receta de planes: https://huggingface.co/woshichaoren123/Eagle-Embodied-4B-Robotics-2D3D-AR
- Drafter del decodificador especulativo: https://huggingface.co/woshichaoren123/Eagle-Embodied-4B-Robotics-2D3D-DFlash
- Repositorio del benchmark de velocidad N2: `eagle-molmospace-speed` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Paper, blog o demo adicionales: no disponibles
