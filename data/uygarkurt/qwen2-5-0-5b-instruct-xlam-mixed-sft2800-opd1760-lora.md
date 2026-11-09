# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd1760-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd1760-lora es un adaptador LoRA entrenado por uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su objetivo es especializar un modelo muy pequeno (0,5 mil millones de parametros) en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. El adaptador se entrena en dos fases: primero 2.800 actualizaciones de supervised fine-tuning (SFT) y despues 1.760 actualizaciones de on-policy distillation (OPD) usando Qwen2.5-3B-Instruct como profesor congelado.

El modelo es relevante porque explora una tecnica de destilacion on-policy aplicada a un modelo de juguete de 0,5B, un regimen donde el margen de mejora es estrecho y los trade-offs entre capacidades generales y especializacion son muy visibles. Los resultados publicados muestran una mejora en la precision de function calling de un solo turno (BFCL) del 51,76% al 56,61%, pero a costa de un empeoramiento severo en la deteccion de irrelevancia (del 58,83% al 10,07%) y una caida en xLAM ETC y FNA.

Se distribuye unicamente como pesos de adaptador PEFT (safetensors), no como modelo completo, lo que implica que debe cargarse sobre el Qwen2.5-0.5B-Instruct original. La model card no especifica licencia, lo que supone un caveat importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens segun su propia documentacion, aunque no se confirma en esta ficha |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base al que se fusione) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parametros. El entrenamiento se realizo con la libreria Post-Training Lab del mismo autor y consta de dos etapas sobre el dataset uygarkurt/xlam-tool-calling-mixed: 2.800 actualizaciones de SFT (0,4 horas) seguidas de 1.760 actualizaciones de OPD (0,6 horas), con un total de 1,0 hora de tiempo de bucle de entrenamiento, excluyendo carga de modelo, preparacion de datos y evaluacion externa.

La innovacion principal es la fase OPD: el estudiante (0,5B) genera sus propias respuestas y aprende de las probabilidades por token del profesor congelado Qwen2.5-3B-Instruct, en lugar de imitar directamente las secuencias del dataset. El dataset mezcla ejemplos de tool calling con ejemplos de abstencion cuando las herramientas ofrecidas son irrelevantes. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de su nombre.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling estructurado: emision de llamadas a funciones con nombre y argumentos en formato estructurado.
- Abstencion ante herramientas irrelevantes: capacidad entrenada explicitamente para rechazar el uso de funciones que no encajan con la consulta (aunque los resultados muestran que el OPD degrada esta habilidad respecto al SFT).
- Razonamiento basico y matematicas elementales, heredados del modelo base (MMLU 39,82%, MATH-500 17,40%).
- Seguimiento de instrucciones basico (IFEval 28,28% en precision estricta a nivel de prompt).
- No se documenta soporte de vision, audio, agentes multi-paso, ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Prototipado de pipelines de tool calling en entornos con recursos muy limitados: el adaptador, fusionado con el modelo base de 0,5B, puede ejecutarse en CPU o en GPUs de gama baja para validar disenos de esquemas de funciones antes de escalar a modelos mayores.
- Investigacion sobre destilacion on-policy: sirve como caso de estudio reproducible de como la OPD afecta a distintas metricas (mejora BFCL, degrada relevancia e irrelevancia) en modelos de muy pocos parametros.
- Ensenanza y experimentacion academica: permite a estudiantes entrenar y evaluar adaptadores LoRA con el framework Post-Training Lab en menos de una hora de computo.
- Generacion de llamadas a funciones en asistentes de dominio cerrado y bien definido: cuando el conjunto de herramientas es fijo y pequeno, el modelo puede emitir llamadas estructuradas con una precision BFCL de un solo turno del 56,61%.
- Evaluacion comparativa de tecnicas de post-entrenamiento: el par SFT vs SFT+OPD publicado en la model card ofrece una referencia cuantitativa para comparar metodologias.
- Filtrado o clasificacion ligera de intenciones de tool calling en preprocesado: el modelo puede usarse como primer clasificador barato antes de invocar un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes). La primera fila es el adaptador SFT que inicializa la OPD; la segunda es el adaptador actual SFT + OPD.

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT (inicial) | SFT 2.800 | 39,80% | 18,40% | 29,57% | 75,88% | 95,76% | 51,76% | 83,33% | 58,83% | 0,4 |
| SFT + OPD (este adaptador) | OPD 1.760 | 39,82% | 17,40% | 28,28% | 68,97% | 87,47% | 56,61% | 100,00% | 10,07% | 1,0 |

Notas de la model card: xLAM ETC es precision exacta de llamada a herramienta; xLAM FNA es precision del nombre de funcion. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 descartados por el limite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno. Relevance e Irrelevance corresponden a subconjuntos de relevancia seleccionados. IFEval usa precision estricta a nivel de prompt. Son agregados especificos del estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 ocupa aproximadamente 1 GB de pesos; el adaptador LoRA anade una cantidad marginal. En cuantizacion de 4 bits el modelo completo cabria en menos de 1 GB, aunque la cuantizacion no se documenta en esta ficha.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2-4 GB de VRAM en fp16.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp u Ollama requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF; vLLM y TGI son compatibles tras fusion del adaptador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT+OPD) | 0,5B + LoRA | no disponible | Tool calling + abstencion | no disponible | Hugging Face (adaptador PEFT) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens (segun doc. de Qwen) | Instrucciones generales | Apache 2.0 (segun doc. de Qwen) | Hugging Face |
| Adaptador SFT 2.800 (mismo autor) | 0,5B + LoRA | no disponible | Tool calling | no disponible | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 tokens (segun doc. de Qwen) | Instrucciones generales | Apache 2.0 (segun doc. de Qwen) | Hugging Face |

No se dispone de comparativas con otros adaptadores de tool calling de 0,5B en la informacion proporcionada.

## Limitaciones y advertencias

- La fase OPD degrada gravemente la deteccion de irrelevancia: del 58,83% al 10,07%, lo que implica que el modelo tiende a invocar herramientas aunque no sean pertinentes.
- Caida en xLAM ETC (75,88% a 68,97%) y FNA (95,76% a 87,47%) tras la OPD: la mejora en BFCL no compensa la perdida en otras metricas de tool calling.
- Capacidades generales muy limitadas: MMLU 39,82%, MATH-500 17,40%, IFEval 28,28%; no es adecuado para tareas de razonamiento complejo.
- Solo soporta ingles; no se documentan capacidades multilingues.
- Licencia no especificada: no se puede asumir uso comercial sin verificar los terminos del modelo base y del adaptador.
- Riesgo de alucinacion en argumentos de funciones y en texto generado, propio de un modelo de 0,5B.
- Limite de 640 tokens de prompt en la evaluacion xLAM: prompts largos quedan fuera y el comportamiento en contextos extensos no esta caracterizado.
- No es un modelo completo: requiere cargar el adaptador sobre Qwen2.5-0.5B-Instruct y, para despliegue en llama.cpp/Ollama/vLLM, fusionar previamente los pesos.
- Resultados de benchmarks son agregados especificos del estudio del autor, no comparables directamente con cifras oficiales de otros papers.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd1760-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Framework de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
