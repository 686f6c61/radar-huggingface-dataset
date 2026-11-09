# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd3520-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd3520-lora` es un adaptador LoRA desarrollado por el usuario uygarkurt sobre la base de Qwen2.5-0.5B-Instruct, el modelo instructivo de 0,5 mil millones de parámetros de Alibaba Qwen. El adaptador no modifica la arquitectura del modelo base: se publica como pesos PEFT que deben cargarse sobre el modelo original. Su objetivo concreto es el entrenamiento de tool calling estructurado y, de forma destacada, la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El adaptador se entrena en dos fases sobre el dataset `uygarkurt/xlam-tool-calling-mixed`: una primera fase de supervised fine-tuning (SFT) de 11.200 actualizaciones y una segunda de on-policy distillation (OPD) de 3.520 actualizaciones, en la que un profesor congelado (Qwen2.5-3B-Instruct) transfiere sus probabilidades de token a las respuestas generadas por el propio estudiante. El resultado es un adaptador ligero orientado a un caso de uso muy específico: integración fiable de un modelo pequeño en pipelines de function calling con detección de irrelevancia.

Es relevante ahora porque demuestra una estrategia de destilación on-policy aplicada a una tarea de comportamiento (abstención) sobre un modelo de 0,5B, un tamaño que cabe holgadamente en cualquier GPU de consumo y permite desplegar agentes de tool calling de bajo coste. La ficha se basa únicamente en la información publicada por el autor; no hay datos de licencia, benchmarks externos ni documentación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); parámetros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización dependería del modelo base y del framework de despliegue) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only del linaje Qwen2.5. El adaptador LoRA añade matrices de bajo rango entrenables sobre las capas del modelo base, que permanece congelado; no se introduce ninguna modificación arquitectónica adicional (no hay atención lineal, decodificación especulativa ni capas SSM). El repositorio contiene únicamente los pesos del adaptador, no los del modelo base.

El entrenamiento se realizó con la herramienta Post-Training Lab del autor sobre el dataset `uygarkurt/xlam-tool-calling-mixed`. La primera fase aplicó 11.200 actualizaciones de SFT (1,8 horas de entrenamiento). La segunda fase continuó el adaptador SFT con 3.520 actualizaciones de OPD (1,3 horas), en las que un profesor congelado, Qwen2.5-3B-Instruct, proporciona las probabilidades de token sobre las respuestas generadas por el estudiante. El tiempo total reportado es de 3,1 horas, excluyendo carga de modelo, preparación de datos y evaluación externa. El dataset mezcla ejemplos de tool calling con ejemplos diseñados para enseñar abstención ante herramientas irrelevantes.

## Capacidades

- Generación de texto conversacional en inglés sobre la base instructiva de Qwen2.5-0.5B.
- Tool calling estructurado: genera llamadas a funciones con nombre de función y argumentos, evaluado con las métricas xLAM ETC (exact tool-call accuracy) y xLAM FNA (function-name accuracy).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando las herramientas ofrecidas no son pertinentes; en la evaluación alcanza un 100,00% en el subconjunto de relevancia seleccionado.
- Razonamiento básico y matemáticas elementales, limitado por el tamaño del modelo base (MMLU 38,74%, MATH-500 17,60%).
- Seguimiento de instrucciones a nivel básico (IFEval 28,47% con precisión estricta a nivel de prompt).
- Soporte multilingüe: únicamente inglés declarado.
- No se documentan capacidades de visión, audio, thinking mode ni agentes multi-paso más allá del tool calling de un solo turno evaluado.

## Casos de uso

- Enrutamiento de herramientas en agentes ligeros: el adaptador puede decidir si una consulta requiere invocar una función y emitir la llamada con el nombre y argumentos correctos, lo que permite construir un router de herramientas de bajo coste sobre una GPU de consumo.
- Abstención en asistentes con catálogo de herramientas limitado: gracias al entrenamiento explícito de irrelevancia (100,00% en el subconjunto de relevancia evaluado), el modelo evita invocar funciones cuando la consulta no encaja, reduciendo llamadas erróneas en producción.
- Prototipado rápido de pipelines de function calling: al ser un adaptador sobre un modelo de 0,5B, se puede cargar con PEFT y transformers en entornos de desarrollo sin infraestructura dedicada, lo que acelera la iteración sobre esquemas de herramientas.
- Clasificación y extracción de intención en backends de bajo presupuesto: el modelo puede procesar consultas y devolver llamadas estructuradas que un orquestador posterior valide, actuando como primera etapa de un sistema mayor.
- Evaluación comparativa de técnicas de post-entrenamiento: el repositorio documenta métricas antes y después de OPD, por lo que sirve como caso de estudio reproducible para investigar destilación on-policy en modelos pequeños.
- Filtrado de consultas fuera de dominio: la capacidad de abstención permite usar el modelo como guardián que descarta peticiones que no corresponden a las herramientas disponibles antes de llegar a un modelo mayor.
- Educación y experimentación: al publicarse los scripts y el dataset asociados a Post-Training Lab, es útil para aprender a entrenar adaptadores LoRA con SFT y OPD sobre tool calling.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa precisión estricta a nivel de prompt. Todas las cifras son porcentajes.

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT (inicial) | 38,36% | 16,20% | 27,36% | 81,46% | 96,98% | 54,28% | 83,33% | 72,91% |
| SFT + OPD (este adaptador) | 38,74% | 17,60% | 28,47% | 70,70% | 88,18% | 59,59% | 100,00% | 11,32% |

La comparación interna muestra una mejora en MMLU, MATH-500, IFEval, BFCL Single-turn FC y Relevance tras la fase OPD, pero un descenso notable en xLAM ETC (de 81,46% a 70,70%), xLAM FNA (de 96,98% a 88,18%) e Irrelevance (de 72,91% a 11,32%). No se han publicado resultados de benchmarks frente a modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en precisión fp16 requiere aproximadamente 1 GB de pesos; en cuantización de 8 bits o 4 bits el consumo es inferior, aunque el autor no publica cifras de cuantización para el adaptador.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede alojar el modelo base en fp16 junto con el adaptador y el contexto; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo modernas, dado el tamaño de 0,5B.
- Opciones de despliegue: PEFT + transformers (forma nativa del adaptador), y previsiblemente vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base y convertir a GGUF; el autor solo documenta el uso con PEFT y transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks externos ni de comparaciones publicadas por el autor frente a otros adaptadores o modelos de tool calling. La única comparación documentada es interna, entre el adaptador SFT inicial y el adaptador SFT + OPD de este repositorio (véase la tabla de benchmarks). Como referencia de categoría, el modelo base Qwen2.5-0.5B-Instruct es un modelo instructivo de 0,5B con licencia Apache 2.0 según su propia model card, pero esta ficha no puede confirmar la licencia del adaptador ni comparar rendimiento con alternativas como xLAM o ToolACE sin datos publicados.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no se puede asumir uso comercial sin verificar la licencia del modelo base Qwen2.5-0.5B-Instruct y la del adaptador.
- El adaptador solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- La evaluación xLAM omite 743 de los 3.289 ejemplos del split de test por el límite de 640 tokens de prompt, lo que puede sesgar las métricas hacia consultas cortas.
- La fase OPD degrada sustancialmente la precisión de llamada exacta (xLAM ETC cae de 81,46% a 70,70%) y la precisión de nombre de función (de 96,98% a 88,18%) respecto al adaptador SFT inicial, además de reducir la métrica de Irrelevance al 11,32%; el modelo gana abstención pero pierde fidelidad en la generación de llamadas.
- El tamaño de 0,5B implica una capacidad limitada de razonamiento y matemáticas (MATH-500 17,60%, MMLU 38,74%), por lo que no es adecuado para tareas que exijan planificación compleja.
- Riesgo de alucinación en argumentos de funciones y en nombres de herramientas fuera de las distribuciones del dataset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- El adaptador debe cargarse sobre Qwen2.5-0.5B-Instruct; no es un modelo autónomo y no incluye los pesos base.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd3520-lora
- Adaptador SFT inicial: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado (OPD): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de entrenamiento Post-Training Lab: https://github.com/uygarkurt/post-training-lab
