# Yesini/Rehearsal-Glimmer-30B-r1

## Resumen

Rehearsal-Glimmer-30B-r1 es un ajuste fino del modelo multimodal meta-models/Muse-Glimmer-30B, desarrollado por el usuario Yesini en el contexto del hackathon META Global AI Developer. El modelo resuelve una tarea muy concreta: simular la decisión de una persona ficticia ante una pantalla de aplicación móvil, devolviendo probabilidades sobre cuatro acciones posibles (instalar desde un anuncio, pagar, volver mañana o borrar la app ante un muro de pago), junto con lo que la persona ha notado y una justificación breve. Forma parte de Rehearsal, un world model de lanzamiento que simula 90 días de un mercado estadounidense con dos planes de lanzamiento distintos.

Técnicamente se trata de un transformer multimodal de 29.776.626.688 parámetros (aproximadamente 29,8 mil millones) con torre de visión, ajustado mediante QLoRA sobre una base cuantizada en 4 bits NF4 y fusionado posteriormente en un checkpoint bf16. El adaptador LoRA se aplicó únicamente a las proyecciones q, k, v y o del modelo de lenguaje, manteniendo congelada la torre de visión. El modelo solo declara soporte para inglés y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada pero clara: demuestra que un ajuste fino ligero (400 pasos, 56 minutos en una H100) puede aproximar el comportamiento de un modelo mayor (Muse Spark) en una tarea de simulación de agentes, hasta el punto de coincidir con él en la opción principal el 84-85 % de las veces, un nivel comparable a la consistencia del propio Spark consigo mismo (86 %).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión, base Muse-Glimmer-30B |
| Parámetros totales | 29.776.626.688 (~29,8 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Base de entrenamiento en 4-bit NF4 con cómputo bf16; checkpoint distribuido en bf16; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Muse-Glimmer-30B, un transformer multimodal con torre de visión que procesa imagen y texto conjuntamente. El ajuste se realizó con QLoRA sobre una única H100: la base se cargó en 4 bits NF4 con cómputo en bf16 y se entrenaron adaptadores LoRA con r = 16, alpha 32 y dropout 0.05 sobre las proyecciones q, k, v y o del modelo de lenguaje, dejando la torre de visión completamente congelada. El entrenamiento consistió en 400 pasos de 16 ejemplos (2 épocas) con learning rate 2e-4, durante 56 minutos; la pérdida de validación bajó de 0.958 a 0.257. La revisión de la base utilizada fue `cec94fcfd6512f2cfe708138c32533b346ea4f69`.

Los datos de destilación provienen de 4.000 personas ficticias, cada una con edad, trabajo, lugar, situación económica, historial de citas y estado de ánimo propios, observando pantallas de una app de citas inventada. Muse Spark (en modo de razonamiento medio) respondió a cada caso y se entrenó al modelo para reproducir únicamente el JSON final de Spark, sin texto de razonamiento intermedio. El conjunto se dividió por persona en 3.201 ejemplos de entrenamiento, 391 de validación y 408 de test. El adaptador resultante se fusionó en el checkpoint bf16 que se publica, porque la ruta LoRA de vLLM falla en este modelo multimodal.

## Capacidades

- Generación de texto estructurado en JSON con un esquema fijo: campo `noticed`, objeto `probabilities` con tres claves que suman 1 y campo `reason`.
- Comprensión de imágenes de pantallas de aplicaciones móviles (muros de pago, anuncios, pantallas de app) combinada con texto.
- Simulación de personajes: mantiene el perfil de una persona concreta (demografía, situación económica, historial, estado emocional) descrito en el system prompt.
- Razonamiento de decisión con probabilidades calibradas sobre opciones discretas.
- Seguimiento de instrucciones de formato estrictas, incluida la apertura directa del turno de asistente al canal de usuario (`to=user<|message|>`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking explícito.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Simulación de mercado para validación de planes de lanzamiento: integrado en Rehearsal, el modelo decide por cada persona simulada a lo largo de 90 días, permitiendo comparar dos estrategias de lanzamiento antes de invertir en un test real.
- Predicción de reacción ante muros de pago: dado un mockup de pantalla de paywall y un perfil de usuario, el modelo estima la probabilidad de pago, de retorno al día siguiente y de abandono, útil para priorizar variantes de pricing.
- Investigación sobre destilación de comportamiento: sirve como caso de estudio reproducible de cómo un QLoRA de 56 minutos aproxima las decisiones de un modelo mayor con un 85 % de coincidencia en la opción principal.
- Generación de perfiles sintéticos para pruebas de producto: los 4.000 perfiles y sus respuestas permiten construir datasets de evaluación de UX sin exponer datos de usuarios reales.
- Análisis de fricción en onboarding: simulando la pantalla de instalación desde un anuncio, se puede medir qué segmentos de población ficticia abandonan antes de instalar.
- Prototipado de agentes de simulación en investigación académica: la licencia Apache 2.0 y el formato JSON fijo facilitan integrarlo en pipelines de experimentación sobre modelos de comportamiento.
- Evaluación de la sensibilidad al copy y al diseño visual: al recibir la imagen de la pantalla, el modelo permite comparar variantes gráficas manteniendo constante el perfil del usuario.

## Benchmarks y rendimiento

Evaluación sobre 408 personas ficticias no vistas en entrenamiento, comparando con la respuesta de Muse Spark:

| Modelo | Misma opción principal | Diferencia absoluta media |
|---|---|---|
| Spark preguntado por segunda vez | 86 % | 0.078 |
| Glimmer antes del entrenamiento | 74 % | 0.151 |
| Glimmer tras entrenamiento (adaptador sobre base 4-bit) | 85 % | 0.079 |
| Glimmer tras entrenamiento (checkpoint bf16 fusionado, vLLM) | 84 % | 0.083 |

En 300 decisiones de una población distinta (personas diseñadas por Muse Wonder), el modelo coincide con Spark en la opción principal el 90 % de las veces, con una diferencia absoluta media de 0.065. Con vLLM sobre una H100, cada decisión tarda 0.064 s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 60 GB solo para pesos, más overhead de activaciones y caché KV; se requiere al menos una GPU de 80 GB.
- GPU recomendadas: H100 de 80 GB (configuración validada por el autor con vLLM), A100 de 80 GB como alternativa.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16; no se documentan versiones GGUF cuantizadas que permitan reducir requisitos.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor`; vLLM funciona con el checkpoint bf16 fusionado, pero la ruta LoRA de vLLM falla en este modelo multimodal según el autor.
- Latencia y throughput: 0.064 s por decisión en una H100 con vLLM; no se documenta throughput agregado por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rehearsal-Glimmer-30B-r1 | ~29,8 B | No disponible | Simulación de decisiones con imagen y texto | Apache 2.0 | HuggingFace (Yesini) |
| meta-models/Muse-Glimmer-30B | No disponible | No disponible | Multimodal image-text-to-text general | No disponible | HuggingFace (meta-models) |
| Muse Spark | No disponible | No disponible | Modelo generador de referencia para destilación | No disponible | No disponible como pesos públicos |

No se dispone de datos suficientes sobre Muse-Glimmer-30B ni Muse Spark (parámetros, contexto, benchmarks) para una comparación cuantitativa completa. La comparación relevante es la de la tabla de resultados: el modelo ajustado se aproxima a Spark (84-85 % de coincidencia) mejor que la base sin ajustar (74 %).

## Limitaciones y advertencias

- Sesgo de generador compartido: las personas de test provienen del mismo generador que las de entrenamiento, por lo que la evaluación demuestra reproducción de Spark en personas del mismo tipo, no validez frente a usuarios reales.
- Hereda los sesgos de Muse Spark, incluidos los sesgos presentes en sus respuestas de entrenamiento.
- Entrenado para una única app ficticia (una app de citas inventada); la generalización a otras apps o dominios no está validada.
- Riesgo de alucinación en los campos `noticed` y `reason`, que son texto libre generado y no están verificados contra la imagen.
- Solo inglés; no se declara soporte de otros idiomas.
- La longitud de contexto no está documentada, lo que dificulta planificar conversaciones multi-turno largas.
- Uso comercial permitido por Apache 2.0, pero la licencia de la base Muse-Glimmer-30B no se detalla en la información disponible y conviene verificarla antes de explotación comercial.
- El checkpoint pesa 59,6 GB y requiere hardware de gama alta; no hay cuantizaciones publicadas para entornos con menos VRAM.
- Validado con vLLM solo en la variante bf16 fusionada; la ruta LoRA de vLLM no funciona en este modelo multimodal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yesini/Rehearsal-Glimmer-30B-r1
- Adaptador LoRA: https://huggingface.co/Yesini/Rehearsal-Glimmer-30B-r1-LoRA
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio del proyecto (código y método): https://github.com/tokyosini573/META-Global-AI-Developer-Hackathon
- Datos de destilación: https://github.com/tokyosini573/META-Global-AI-Developer-Hackathon/tree/main/data/distill
- Pantallas de la simulación: https://github.com/tokyosini573/META-Global-AI-Developer-Hackathon/tree/main/engine/screens/out
- Script de entrenamiento, evaluación y serving: https://github.com/tokyosini573/META-Global-AI-Developer-Hackathon/blob/main/engine/distill/glimmer_modal.py
