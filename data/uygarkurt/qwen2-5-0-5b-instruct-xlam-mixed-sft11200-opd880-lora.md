# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd880-lora

## Resumen
El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd880-lora` es un adaptador LoRA entrenado sobre el modelo base Qwen2.5-0.5B-Instruct, desarrollado por el usuario uygarkurt. Su objetivo es especializar un modelo pequeño de 0,5 mil millones de parámetros en la generación estructurada de llamadas a herramientas (tool calling), incluyendo la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta. El adaptador se entrena en dos fases: primero un ajuste supervisado (SFT) de 11.200 actualizaciones y después una destilación en política (OPD) de 880 actualizaciones usando Qwen2.5-3B-Instruct como profesor congelado.

El modelo resulta relevante porque demuestra que es posible dotar a un modelo de tamaño muy reducido de capacidades funcionales de tool calling mediante técnicas de post-entrenamiento eficientes, con un coste de entrenamiento de apenas 2,1 horas. Esto lo convierte en un candidato interesante para entornos con recursos limitados donde se necesita un modelo ligero que sepa invocar funciones y detectar cuándo no debe hacerlo.

El adaptador se distribuye como pesos PEFT/LoRA en safetensors y requiere cargarse sobre el modelo base original Qwen2.5-0.5B-Instruct. La model card reporta métricas de evaluación propias sobre conjuntos de datos de tool calling, además de benchmarks generales como MMLU, MATH-500 e IFEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estandar de la familia Qwen2.5) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El entrenamiento se realizó con Post-Training Lab en dos etapas sobre el dataset `uygarkurt/xlam-tool-calling-mixed`, que combina datos de tool calling. La primera etapa consistió en 11.200 actualizaciones de ajuste supervisado (SFT), con una duración de 1,8 horas. La segunda etapa continuó el adaptador SFT con 880 actualizaciones de destilación en política (OPD), en la que el estudiante aprende de las probabilidades por token del profesor Qwen2.5-3B-Instruct sobre sus propias respuestas generadas, con una duración de 0,3 horas. El tiempo total de entrenamiento reportado es de 2,1 horas, excluyendo carga de modelo, preparación de datos y evaluación externa.

La innovación principal es el uso de OPD sobre un adaptador SFT para mejorar el comportamiento de llamada a funciones y, especialmente, la capacidad de abstención ante herramientas irrelevantes. La model card indica que el adaptador SFT previo no es necesario por separado: este repositorio contiene los pesos finales que integran ambas fases.

## Capacidades
- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: generación de llamadas a funciones en formato estructurado, evaluado con métricas xLAM ETC (exactitud exacta de llamada) y xLAM FNA (exactitud del nombre de función).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando las herramientas ofrecidas no son pertinentes.
- Razonamiento general y matemáticas básicas, evaluado con MMLU y MATH-500.
- Seguimiento de instrucciones, evaluado con IFEval.
- Soporte de function calling de un solo turno, evaluado con subconjuntos de BFCL-v3.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se reportan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso
- Agentes de tool calling en entornos con recursos limitados: el adaptador permite que un modelo de 0,5B invoque funciones estructuradas, adecuado para asistentes ligeros que deben ejecutar acciones como consultar APIs o recuperar datos.
- Detección de herramientas irrelevantes: gracias al entrenamiento en abstención, puede usarse como filtro previo que decida si una consulta requiere invocar alguna de las herramientas disponibles o responder directamente.
- Automatización de flujos de atención al cliente con funciones acotadas: el modelo puede seleccionar entre un conjunto cerrado de herramientas (consultar pedido, abrir incidencia) y abstenerse cuando la consulta queda fuera de alcance.
- Prototipado rápido de pipelines de function calling: al ser un adaptador LoRA sobre un modelo de 0,5B, permite iterar y desplegar en CPU o GPU de gama baja para validar diseños de agentes antes de escalar a modelos mayores.
- Enrutamiento de consultas en sistemas multi-herramienta: puede clasificar y derivar consultas hacia la función adecuada, con la ventaja de reconocer cuándo ninguna aplica.
- Evaluación comparativa de técnicas de post-entrenamiento: sirve como referencia reproducible (SFT frente a SFT+OPD) para investigar destilación en política en modelos pequeños.
- Despliegue en dispositivos con memoria reducida: al requerir solo el modelo base de 0,5B más el adaptador, es viable en entornos con VRAM muy limitada.

## Benchmarks y rendimiento

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Adaptador SFT inicial | SFT 11.200 | 38,36% | 16,20% | 27,36% | 81,46% | 96,98% | 54,28% | 83,33% | 72,91% | 1,8 |
| SFT + OPD (este adaptador) | OPD 880 | 38,58% | 16,40% | 27,91% | 80,91% | 96,58% | 58,31% | 94,44% | 35,92% | 2,1 |

Notas de la model card: xLAM ETC es la exactitud exacta de llamada a herramienta y xLAM FNA la exactitud del nombre de función; las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el límite de prompt de 640 tokens. BFCL Single-turn FC resume subconjuntos seleccionados de function calling de un solo turno de BFCL-v3; Relevance e Irrelevance corresponden a subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts propios de Post-Training Lab.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base de 0,5B en precisión completa (FP16) ocupa aproximadamente 1 GB; en cuantización de 8 bits alrededor de 0,5 GB y en 4 bits en torno a 0,3 GB, más el pequeño tamaño del adaptador LoRA.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. También es viable en CPU para inferencia de baja concurrencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer con al menos 2-4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, y vLLM o TGI tras fusionar los pesos. La model card solo documenta el uso vía PEFT/transformers.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA) | 0,5B | no disponible | Entrenado específicamente (xLAM, BFCL) | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens (según documentación de Qwen) | Capacidad genérica, sin especialización | Apache 2.0 (según Qwen) | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 tokens (según documentación de Qwen) | Capacidad genérica | Apache 2.0 (según Qwen) | Hugging Face |

La comparación con alternativas especializadas en tool calling de tamaño similar no está disponible en la información proporcionada. Los datos del modelo base y del profesor provienen de la documentación pública de Qwen y no de la model card de este adaptador.

## Limitaciones y advertencias
- El adaptador está entrenado únicamente en inglés; no se reporta soporte multilingüe.
- El modelo base es de 0,5B parámetros, con rendimiento general limitado: MMLU 38,58%, MATH-500 16,40% e IFEval 27,91%, lo que restringe su uso a tareas acotadas.
- La métrica de Irrelevance cae del 72,91% (SFT) al 35,92% (SFT+OPD), lo que indica un empeoramiento en la detección de herramientas irrelevantes tras la destilación en política; debe tenerse en cuenta si la abstención es crítica.
- Riesgo de alucinación inherente a modelos pequeños, especialmente en razonamiento y matemáticas.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial; debe verificarse antes de producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente, por lo que carece de validación externa.
- El adaptador requiere cargarse sobre el modelo base Qwen2.5-0.5B-Instruct; no es un modelo autónomo.
- Las evaluaciones xLAM omitieron 743 ejemplos por el límite de prompt de 640 tokens, lo que puede sesgar los resultados hacia consultas cortas.
- Las puntuaciones BFCL son agregados específicos del estudio, no resultados oficiales del benchmark completo.

## Enlaces
- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd880-lora
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-lora
