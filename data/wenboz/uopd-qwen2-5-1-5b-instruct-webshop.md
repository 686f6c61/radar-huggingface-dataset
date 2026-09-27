# Wenboz/UOPD-Qwen2.5-1.5B-Instruct-WebShop

## Resumen

UOPD-Qwen2.5-1.5B-Instruct-WebShop es un checkpoint final de estudiante obtenido mediante destilación on-policy (etiquetada en el repositorio como UOPD) sobre el entorno WebShop, partiendo de Qwen/Qwen2.5-1.5B-Instruct como inicialización y utilizando como profesor congelado el modelo langfeng01/GiGPO-Qwen2.5-7B-Instruct-WebShop. Lo publica el usuario de Hugging Face Wenboz y está pensado como artefacto de investigación para el entrenamiento de agentes LLM en tareas de compra o navegación web, no como modelo de propósito general.

El modelo conserva el backbone Qwen2 de 1.777.088.000 parámetros totales (aproximadamente 1,78 mil millones, según los pesos en safetensors) y el tokenizador de Qwen2.5, por lo que hereda la arquitectura transformer decoder-only del modelo base. Su interés práctico reside en que concentra en un modelo pequeño el comportamiento de un agente entrenado en WebShop que originalmente requería un profesor de 7B, lo que reduce drásticamente el coste de inferencia para experimentos de agentes.

La relevancia es doble: por un lado, sirve como referencia reproducible de un pipeline de destilación on-policy con intervención del profesor (teacher takeover) y pérdida SFT sobre turnos disparados; por otro, permite validar hasta qué punto un estudiante de 1,5B puede imitar a un agente de 7B en un entorno de decisión multi-turno. El repositorio no declara licencia ni idiomas soportados, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada de Qwen/Qwen2.5-1.5B-Instruct |
| Parámetros totales | 1.777.088.000 (aprox. 1,78 mil millones, dato de safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No confirmada en la model card; 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct. El entrenamiento usó prompts de hasta 4.096 tokens y respuestas de hasta 512 tokens |
| Tipos de cuantización | No disponible en el repositorio (solo safetensors en bfloat16). Al ser un Qwen2, se pueden generar cuantizaciones GGUF, AWQ o GPTQ con herramientas estándar |
| Idiomas soportados | No disponible en la model card (el modelo base Qwen2.5-Instruct es multilingüe; el entorno WebShop es en inglés) |
| Licencia | No disponible (la model card no declara licencia; el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors (bfloat16), librería transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y sesgo de atención QKV (QKV bias), además de embeddings de tokens atados a la matriz de salida. No hay innovaciones arquitectónicas propias en este checkpoint; el cambio respecto al base está íntegramente en los pesos, ajustados mediante destilación desde un profesor de 7B.

El entrenamiento se realizó con el pipeline denominado UOPD (la model card no expande el acrónimo; los tags indican on-policy distillation). La configuración declarada es la siguiente: inicialización del estudiante en Qwen/Qwen2.5-1.5B-Instruct, profesor congelado langfeng01/GiGPO-Qwen2.5-7B-Instruct-WebShop, 150 pasos de entrenamiento, batch de rollout de 16 y batch de entrenamiento de 64, límite de 15 pasos por episodio en el entorno, máximo de 4.096 tokens de prompt y 512 de respuesta, optimizador AdamW con learning rate 1e-6, tasa de intervención objetivo lineal de 0,50 a 0,30 durante los primeros 75 pasos (después fija en 0,30), pérdida de tipo SFT plano con peso 1,0 sobre los turnos disparados y teacher takeover activado. El entorno de entrenamiento es WebShop, un banco de pruebas de compra web con instrucciones en lenguaje natural y acciones textuales.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Comportamiento de agente en entornos tipo WebShop: selección de acciones de búsqueda y navegación a partir de observaciones textuales de la página.
- Razonamiento multi-turno con límite de 15 pasos por episodio durante el entrenamiento.
- Emisión de acciones en formato textual compatible con entornos de agente basados en texto (no se documenta un esquema formal de tool calling en la model card).
- Ejecución con el pipeline text-generation de transformers y compatibilidad declarada con text-generation-inference y endpoints compatibles.
- Capacidades multilingües: no disponibles como dato declarado; el ajuste se ha realizado sobre WebShop, cuyo contenido está en inglés.
- No se documentan capacidades de visión, audio, thinking mode ni decodificación especulativa específica.

## Casos de uso

- Investigación en destilación on-policy: reproducir o comparar el efecto de la tasa de intervención del profesor (0,50 → 0,30) sobre la calidad del estudiante en un entorno de decisión; el checkpoint es el resultado final de 150 pasos con esa configuración concreta.
- Evaluación de agentes web de bajo coste: desplegar un agente de 1,78B que imite el comportamiento de un profesor de 7B en tareas de compra, reduciendo el coste por episodio en experimentos a gran escala.
- Generación de datos sintéticos de trayectorias: usar el estudiante para producir rollouts de búsqueda y navegación que después se filtren o se etiqueten con el profesor.
- Baseline en benchmarks de agentes: servir como punto de comparación frente al modelo base Qwen2.5-1.5B-Instruct sin ajustar y frente al profesor GiGPO de 7B en la misma tarea.
- Prototipado de asistentes de compra conversacionales: dado que el modelo fue entrenado con instrucciones de producto y acciones de navegación, sirve para validar interfaces de agente antes de invertir en modelos mayores.
- Despliegue en hardware limitado para demos: con cuantización de 4 bits el modelo ocupa alrededor de 1-1,2 GB, por lo que puede ejecutarse en portátiles o GPUs de gama de entrada para demostraciones interactivas de agentes.
- Estudio de imitación de profesor: analizar qué comportamientos del profesor de 7B se retienen y cuáles se pierden al comprimir a 1,78B, útil para diseñar estrategias de destilación más eficientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito en WebShop, tasas de recompensa, ni resultados en evaluaciones estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en bfloat16/fp16: aproximadamente 3,6 GB solo para los pesos, más caché KV y activaciones; en la práctica unos 4,5-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,9 GB de pesos, unos 2,5-3 GB en total.
- VRAM estimada en cuantización de 4 bits: alrededor de 1,0-1,2 GB de pesos, unos 1,5-2 GB en total (requiere convertir los pesos, ya que el repositorio solo publica safetensors en bfloat16).
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090, A10G, L4, A100, H100). En consumer cabe holgadamente; incluso en GPUs de 6 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` (uso documentado en la model card), vLLM o TGI para inferencia con batching, y llama.cpp u Ollama si se genera previamente una versión GGUF.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por episodio.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| UOPD-Qwen2.5-1.5B-Instruct-WebShop | 1,78B | no confirmado (32.768 tokens en el base) | no disponible | Hugging Face, 0 descargas en el momento de la consulta |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,78B (mismo backbone) | 32.768 tokens | Apache-2.0 | Ampliamente disponible |
| langfeng01/GiGPO-Qwen2.5-7B-Instruct-WebShop (profesor) | 7B aprox. (según nomenclatura) | no disponible en esta ficha | no disponible | Hugging Face |
| Otros checkpoints de destilación para WebShop | no disponible | no disponible | no disponible | No se han identificado alternativas equivalentes en la información disponible |

No se dispone de datos de rendimiento comparados entre estas opciones, por lo que la comparativa se limita a parámetros, contexto declarado, licencia y disponibilidad.

## Limitaciones y advertencias

- Ámbito muy restringido: el ajuste se realizó sobre WebShop, un entorno de compra web en inglés; el modelo puede degradarse fuera de ese dominio y no debe asumirse comportamiento generalista.
- Entrenamiento corto: solo 150 pasos, con un máximo de 512 tokens de respuesta, lo que limita la longitud y complejidad de las acciones o razonamientos que puede emitir.
- Licencia no declarada: al no especificarse licencia en la model card, el uso comercial es jurídicamente incierto, aunque el modelo base Qwen2.5-1.5B-Instruct sea Apache-2.0.
- Riesgo de alucinación: como cualquier modelo de 1,78B, puede inventar productos, opciones o acciones no presentes en la observación del entorno; en tareas de agente esto se traduce en acciones inválidas.
- Idiomas: no hay declaración oficial de idiomas soportados; el entrenamiento específico se hizo sobre datos en inglés, por lo que el rendimiento en castellano no está garantizado.
- Herencia del profesor: al ser una destilación, reproduce también los sesgos y errores del modelo GiGPO-Qwen2.5-7B-Instruct-WebShop, sin mecanismos adicionales de alineación documentados (no se mencionan RLHF ni DPO en la model card).
- Formato de pesos limitado: solo safetensors en bfloat16; el despliegue en CPU o en GPUs pequeñas requiere una conversión previa a GGUF u otro formato cuantizado.
- Sin métricas publicadas: no hay evidencia cuantitativa de que el estudiante iguale al profesor, por lo que cualquier afirmación de rendimiento debe validarse internamente.
- Los resultados de la búsqueda web asociados a esta consulta no contienen información técnica relevante sobre el modelo (contenido no relacionado), por lo que no se han utilizado como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wenboz/UOPD-Qwen2.5-1.5B-Instruct-WebShop
- Profesor (GiGPO-Qwen2.5-7B-Instruct-WebShop): https://huggingface.co/langfeng01/GiGPO-Qwen2.5-7B-Instruct-WebShop
- Modelo base (Qwen2.5-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de WebShop (Yao et al., 2022): https://arxiv.org/abs/2207.01206
- Repositorio de WebShop: https://github.com/princeton-nlp/WebShop

Nota: la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo, por lo que no se incluyen enlaces adicionales a papers, blogs o demos del autor.
