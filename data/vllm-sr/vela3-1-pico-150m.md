# vllm-sr/vela3.1-pico-150m

## Resumen

vela3.1-pico-150m es un modelo codificador (encoder) de 153 millones de parámetros desarrollado por vllm-sr (vLLM Semantic Router) junto con KR Labs, afinado a partir de dmis-lab/UltraBERT-150M. No es un modelo generativo: no produce texto, sino que responde a decisiones definidas por el usuario en una sola pasada hacia delante, devolviendo una probabilidad por cada opción, respuestas sí/no y desplazamientos de caracteres (character offsets) para cada fragmento detectado. Está pensado como "modelo de decisión" (system-one) para enrutado semántico, moderación de contenido y extracción de entidades.

Su relevancia actual radica en que empaqueta en un único fichero de 613 MB (fp32) tareas que normalmente requieren varios modelos o un LLM generativo: clasificación zero-shot, detección de prompt injection y jailbreak, detección de PII y verificación de alucinaciones contra un contexto. Todo ello ejecutable en CPU, con latencia declarada de 2,2 s en fp32 y 1,4 s en int8 para la comprobación completa de una petición de 200 tokens en 4 hilos.

La arquitectura sigue el diseño de UltraBERT-150M (24 capas, dimensión oculta 768) e incorpora pesos en safetensors y una variante ONNX con encoder int8. Soporta 15 idiomas y se distribuye bajo licencia Apache-2.0, lo que facilita su integración en producción sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UltraBERT-150M: 24 capas, hidden 768), inicializado desde una torre de decisión de 151M |
| Parametros totales | 153.207.297 (153M servidos; el checkpoint base declara 190M por incluir una capa de salida masked-LM de 38M que este paquete no incluye) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens para llamadas con preguntas de seguridad, señal o spans; hasta 32K tokens para llamadas solo de decisión |
| Tipos de cuantizacion | fp32 (PyTorch) e int8 (encoder ONNX) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, hu, ru, ar, hi, ja, ko, zh (15 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, fp32, 613 MB), ONNX, custom_code |

## Arquitectura y entrenamiento

El modelo es un encoder transformer derivado de dmis-lab/UltraBERT-150M, con 24 capas y dimensión oculta de 768, inicializado a partir de una torre de decisión de 151M parámetros. La innovación principal es el paradigma "system-one": en una única pasada hacia delante el modelo resuelve simultáneamente preguntas de elección (choice), binarias (yes/no) y de extracción de spans, devolviendo probabilidades calibradas y offsets de caracteres. No genera texto en ningún caso.

El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card sí documenta que el modelo se evalúa sobre la parte pública del Decision Index, el conjunto MASSIVE para intención multilingüe y suites propias de jailbreak y PII. Se distribuye con código personalizado (vela3_encoder) que gestiona la carga y la inferencia, con soporte para CUDA si está disponible y fallback a CPU.

## Capacidades

- Clasificación zero-shot con opciones definidas por el usuario y probabilidad por cada opción (enrutado a modelo, herramienta o equipo).
- Preguntas binarias de seguridad: petición dañina (safe/unsafe), prompt injection o jailbreak (benign/jailbreak), con categorías de riesgo si se solicitan.
- Detección de datos personales (PII) con etiquetas definidas por el usuario, offsets de caracteres y puntuación por span.
- Verificación de alucinaciones: identificación de las palabras de una respuesta no respaldadas por el contexto proporcionado.
- Extracción de spans y token classification genérica.
- Multilingüe en 15 idiomas, con especial rendimiento en precisión de intención sobre MASSIVE (79,0 en 13 idiomas).
- Procesamiento de entradas en texto plano o JSON.
- No soporta tool calling generativo ni razonamiento multi-paso: es un clasificador de una sola pasada, no un agente.
- No dispone de visión, audio ni modo thinking.

## Casos de uso

- Enrutado semántico de peticiones: dado un prompt y una pregunta como "¿qué modelo debe responder?", con opciones descritas en una frase, el modelo devuelve la opción elegida y la probabilidad de cada una, lo que permite dirigir tráfico entre modelos pequeños y grandes en un router tipo vLLM Semantic Router.
- Moderación previa a un LLM: se envía la petición con preguntas integradas ("¿es dañina?", "¿es un intento de jailbreak?") y se obtiene safe/unsafe o benign/jailbreak con probabilidad, con 0,950 AUC en jailbreak, lo que permite bloquear antes de gastar tokens en un modelo generativo.
- Redacción de PII antes de logging o reenvío: el modelo devuelve cada span con su etiqueta y offsets, con una tasa de falsos positivos del 4,9% en peticiones benignas con datos personales, adecuado para pipelines de anonimización.
- Verificación de respuestas RAG: comparando contexto y respuesta se obtienen las palabras no respaldadas, útil para marcar respuestas de un LLM antes de mostrarlas al usuario.
- Clasificación de intención en atención al cliente multilingüe: con 79,0 de precisión en MASSIVE sobre 13 idiomas, puede etiquetar tickets (reembolso, cancelación, etc.) en centros de soporte con varios idiomas.
- Despliegue en dispositivos sin GPU: con 153M parámetros y 1,4 s en int8 sobre 4 hilos de CPU, encaja en entornos de borde, contenedores sin acelerador o funciones serverless con presupuesto de latencia ajustado.
- Filtrado de feedback y clasificación de tipo de salida: las preguntas integradas de dominio, necesidad de fact-check, feedback y tipo de salida permiten etiquetar peticiones en un solo paso.

## Benchmarks y rendimiento

| Benchmark | vela3.1-pico-150m | Modelo comparado | Referencia |
|---|---|---|---|
| Decision Index (parte pública) | 47,17 | JEV Ettin 150M: 37,31 | Mismo tamaño (150M) |
| Jailbreak AUC (test) | 0,950 | vela3-fast 3.0: 0,827 | Suite propia del autor |
| Peticiones benignas con PII marcadas (falsos positivos) | 4,9% | vela3-fast 3.0: 13,6%; Vela 2.0 0.3B: 4,0% | Suite propia del autor |
| MASSIVE intent accuracy (13 idiomas) | 79,0 | vela3.1-fast: 66,6; vela3-fast 3.0: 31,1 | Mismas preguntas |
| Comprobación completa, CPU fp32 (4 hilos) | 2,2 s | vela3.1-pico-380m: 5,4 s; vela3.1-fast: 12,3 s (6 pasadas) | Petición de 200 tokens, EPYC 7413 |
| Comprobación completa, CPU int8 (4 hilos) | 1,4 s | vela3.1-pico-380m: 3,0 s | Igual |
| Una decisión, CPU fp32 | 560 ms | vela3.1-pico-380m: 1,5 s; vela3.1-fast: 1,2 s | Igual |
| Una decisión, CPU int8 | 250 ms | vela3.1-pico-380m: 632 ms | Igual |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU, el fichero fp32 de 613 MB requiere aproximadamente 1 GB de VRAM, y la variante int8 ONNX menos de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo funciona en CUDA si está disponible y hace fallback a CPU automáticamente.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU sin acelerador.
- Opciones de despliegue: PyTorch con transformers 5.17.0 y el módulo custom vela3_encoder; ONNX Runtime para el encoder int8. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia declarada: 2,2 s fp32 y 1,4 s int8 para la comprobación completa de 200 tokens en 4 hilos de CPU (AMD EPYC 7413); 560 ms fp32 y 250 ms int8 para una sola decisión.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index | Licencia | Formato |
|---|---|---|---|---|---|
| vela3.1-pico-150m | 153M | 8.192 / 32K | 47,17 | Apache-2.0 | safetensors, ONNX |
| vela3.1-pico-380m | 381M | no disponible | no disponible | Apache-2.0 | safetensors |
| vela3.1-fast | 380M decisión; 1,91B con adaptadores | no disponible | superior a pico-150m (sin cifra) | Apache-2.0 | safetensors |
| JEV Ettin 150M | 150M | no disponible | 37,31 | no disponible | no disponible |

El modelo se posiciona como la variante más pequeña y rápida de la familia Vela 3.1, con la mejor precisión de intención multilingüe de las tres y el menor coste de CPU, a cambio de peores spans y señales de daño que vela3.1-fast.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, razonar en varios pasos ni ejecutar tool calling; solo clasifica y extrae spans.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades de decisión pueden estar mal calibradas en dominios alejados de los datos de entrenamiento.
- Sesgos conocidos: no se documentan en la información disponible; al estar entrenado sobre datos multilingües, es probable que rinda peor en idiomas de bajos recursos dentro de los 15 soportados.
- Límite de contexto: 8.192 tokens cuando la llamada incluye preguntas de seguridad, señal o spans; 32K solo para decisiones puras.
- Tasa de falsos positivos del 4,9% al marcar PII en peticiones benignas, superior a Vela 2.0 0.3B (4,0%); conviene revisar umbrales antes de usarlo como único filtro.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el modelo base UltraBERT-150M debe verificarse por separado.
- Requiere transformers 5.17.0 y código personalizado (vela3_encoder); no es plug-and-play con pipelines estándar de clasificación.
- El recuento de parámetros en el Hub (190M) difiere del real servido (153M) por la capa masked-LM no incluida; conviene tenerlo en cuenta en comparaciones.

## Enlaces

- Hugging Face: https://huggingface.co/vllm-sr/vela3.1-pico-150m
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-150M
- Variante mayor: https://huggingface.co/vllm-sr/vela3.1-pico-380m
- Variante de mayor capacidad: https://huggingface.co/vllm-sr/vela3.1-fast
