# spacetime9/QuatTucker-ZigZagGPT-16-95M-Chat

## Resumen

QuatTucker-ZigZagGPT-16-95M-Chat es un ajuste fino supervisado (SFT) del modelo base spacetime9/QuatTucker-ZigZagGPT-16-95M, desarrollado por Shubham Barmase (usuario spacetime9). Se trata de un modelo de lenguaje de pequeno tamano (95,31M parametros totales, con un backbone de 56,71M) entrenado sobre 100.000 pares de instrucciones limpios del dataset SmolTalk de HuggingFaceTB. El modelo esta disenado para conversacion e instrucciones en ingles.

La relevancia tecnica del modelo reside en su arquitectura, denominada Quaternion-Tucker ZigZag Networks, que segun el autor reduce a la mitad los parametros del backbone respecto a un transformer convencional y habilita lo que describe como "escalado continuo 2D con perdida cero exacta". El modelo base fue preentrenado con 2.550 millones de tokens y consta de 16 capas organizadas en 4 "Braided ZigZag Diamonds".

Este checkpoint es un SFT ligero (22,2 minutos en una NVIDIA A100 en bf16) que parte de un modelo base experimental de investigacion. Su interes es principalmente academico y de exploracion arquitectonica, no de produccion: el modelo es muy pequeno, solo soporta ingles y su ventana de contexto esta limitada a 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Quaternion-Tucker ZigZag Network (16 capas, 4 Braided ZigZag Diamonds) |
| Parametros totales | 95,31M (backbone: 56,71M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_len=512) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, bf16 en entrenamiento) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, checkpoint `best_2.5B_depth16_chat.pt`) |

## Arquitectura y entrenamiento

La arquitectura es propietaria del autor y se describe en el preprint "Quaternion-Tucker ZigZag Networks: Halving Transformer Backbone Parameters and Enabling Exact 2D Zero-Loss Continual Scaling" (DOI 10.5281/zenodo.24424502). Se compone de 16 capas estructuradas en 4 Braided ZigZag Diamonds, con un rango de Tucker de 8192 y una longitud maxima de secuencia de 512. El modelo base se preentreno con 2.550 millones de tokens. No se detalla en la informacion disponible la composicion del dataset de preentrenamiento ni si se emplearon tecnicas de RLHF o DPO.

El ajuste fino supervisado se realizo sobre 99.000 pares de entrenamiento y 1.000 de validacion del dataset HuggingFaceTB/smoltalk, con enmascaramiento de perdida solo en el turno del asistente. El entrenamiento duro 3.093 pasos con tamano de batch efectivo de 32, programacion coseno de learning rate de 1e-4 a 1e-5, calentamiento de 150 pasos, precision bf16 y 22,2 minutos en una NVIDIA A100. La curva de validacion muestra 11 descensos monotonos, pasando de una perdida de 2,0456 (perplejidad 7,73) en el paso 0 a 1,4975 (perplejidad 4,47) en el paso 3.093.

## Capacidades

- Generacion de texto conversacional en ingles con formato de prompt `User: ... / Assistant: ...`.
- Seguimiento de instrucciones basicas aprendido mediante SFT sobre SmolTalk.
- Dialogo de un solo turno o multi-turno corto, limitado por la ventana de 512 tokens.
- Razonamiento y conocimiento general de alcance limitado, coherente con un modelo de ~95M de parametros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion arquitectonica: reproduccion y estudio de la arquitectura Quaternion-Tucker ZigZag comparandola con transformers de parametros equivalentes en tareas controladas de laboratorio.
- Prototipado rapido de pipelines de chat: al ser un modelo de 95M de parametros, permite iterar sobre formatos de prompt y evaluar flujos conversacionales basicos sin coste de infraestructura.
- Educacion y docencia: ejemplo practico de un ciclo completo de preentrenamiento y SFT con un presupuesto computacional minimo (22 minutos en A100 para el SFT).
- Generacion de respuestas cortas en ingles: tareas de clasificacion generativa, respuestas de FAQ o completado de plantillas donde la latencia importa mas que la profundidad.
- Pruebas de integracion en entornos de desarrollo: validacion de codigo de carga de checkpoints, tokenizadores y formatos de prompt antes de migrar a modelos mayores.
- Experimentos de destilacion o comparacion: linea base de baja capacidad contra la que medir mejoras de arquitecturas alternativas en benchmarks controlados.
- Despliegue en dispositivos con recursos muy limitados: por su tamano, cabe en CPU o GPU de gama baja para demos offline, siempre que la tarea no exija contexto largo ni multilingue.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados corresponden a la curva de validacion del SFT sobre SmolTalk:

| Paso | Perdida de validacion | Perplejidad |
|---:|---:|---:|
| 0 | 2,0456 | 7,73 |
| 600 | 1,6529 | 5,22 |
| 1200 | 1,5982 | 4,94 |
| 1800 | 1,5541 | 4,73 |
| 2400 | 1,5187 | 4,57 |
| 3093 (mejor) | 1,4975 | 4,47 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 para los 95,31M de parametros (aproximadamente 0,2 GB de pesos mas activaciones y cache de atencion para 512 tokens).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; el entrenamiento del SFT se realizo en una NVIDIA A100 en 22,2 minutos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM, y en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: el modelo requiere el codigo del repositorio GitHub del autor (`quattucker_zigzag_v2`) y carga via PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es un checkpoint `.pt` propietario.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QuatTucker-ZigZagGPT-16-95M-Chat | 95,31M (backbone 56,71M) | 512 | MIT | Hugging Face + GitHub |
| SmolLM-135M (HuggingFaceTB) | 135M | 2048 | Apache 2.0 | Hugging Face, ampliamente soportado |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Hugging Face, ecosistema maduro |

La comparativa con SmolLM-135M y GPT-2 small es orientativa por tamano; no se dispone de datos de benchmarks que permitan una comparacion de rendimiento directa. Los modelos alternativos cuentan con soporte nativo en herramientas de inferencia estandar (llama.cpp, vLLM, TGI), mientras que este checkpoint depende de codigo propio.

## Limitaciones y advertencias

- Modelo de muy baja capacidad (95,31M de parametros): propenso a errores factuales, razonamiento superficial y respuestas genericas.
- Riesgo elevado de alucinacion, especialmente en preguntas de conocimiento especifico o actualizado.
- Ventana de contexto de solo 512 tokens: inadecuado para documentos largos, conversaciones extensas o tareas de recuperacion.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Sin soporte documentado de tool calling, agentes ni integracion con frameworks estandar de inferencia.
- La licencia MIT permite uso comercial, pero el estado experimental del modelo y la falta de benchmarks desaconsejan su uso en produccion sin evaluacion previa.
- Dependencia de codigo propietario (`quattucker_zigzag_v2`) para cargar los pesos, lo que anade riesgo de mantenimiento.
- El SFT se limita a 100.000 pares de SmolTalk; no se documenta alineacion adicional (RLHF/DPO) ni filtros de seguridad.
- No se han publicado evaluaciones de sesgos; se desconoce el comportamiento del modelo en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spacetime9/QuatTucker-ZigZagGPT-16-95M-Chat
- Modelo base: https://huggingface.co/spacetime9/QuatTucker-ZigZagGPT-16-95M
- Preprint (DOI): https://doi.org/10.5281/zenodo.24424502
- Repositorio GitHub: https://github.com/shu195/QuatTucker-ZigZagGPT
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
