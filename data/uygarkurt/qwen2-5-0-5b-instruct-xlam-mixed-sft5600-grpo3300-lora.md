# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo3300-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo3300-lora` es un adaptador LoRA (PEFT) construido sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only denso de aproximadamente 0,5 mil millones de parámetros. Lo publica el usuario uygarkurt y su propósito es muy concreto: especializar un modelo muy pequeño en *tool calling* estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la petición del usuario.

El entrenamiento es en dos fases sobre el dataset `uygarkurt/xlam-tool-calling-mixed`: primero 5.600 actualizaciones de supervisión (SFT) y después 3.300 actualizaciones de Group Relative Policy Optimization (GRPO) partiendo del adaptador SFT. Todo el pipeline se ejecutó con la herramienta Post-Training Lab del mismo autor, con un coste declarado de 2,7 horas de cómputo en total.

Su relevancia práctica no está en el rendimiento generalista, que es bajo por tamaño (MMLU 38,89%, MATH-500 16,40%), sino en que demuestra un flujo reproducible de SFT + GRPO para enseñar a un modelo de 0,5B a emitir llamadas a funciones con formato correcto (79,23% de exactitud en xLAM ETC, 97,38% de acierto en el nombre de la función) y a operar en el edge con menos de 2 GB de VRAM. La mejora de GRPO frente a SFT es medible: +3,1 puntos en xLAM ETC, +4,1 en BFCL single-turn y +4,4 puntos en la detección de irrelevancia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), con adaptador LoRA PEFT |
| Parámetros totales | ~0,5 B en el modelo base; parámetros entrenables del adaptador: no disponible |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-0.5B-Instruct; no se especifica en la model card del adaptador ni se ha evaluado a esa longitud |
| Tipos de cuantización | No disponible en la información. Al ser un adaptador LoRA en safetensors, puede fusionarse con la base y cuantizarse (GGUF, AWQ, GPTQ) mediante herramientas estándar, pero el autor no lo documenta |
| Idiomas soportados | Inglés (declarado en la model card); el base Qwen2.5 es multilingüe, pero el adaptador no declara ni evalúa otros idiomas |
| Licencia | No disponible (la model card no declara licencia para el adaptador; el modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere cargar el base por separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con atención de causal estándar, alrededor de 0,5B parámetros y 32.768 tokens de contexto, alineado con instrucciones por el equipo de Qwen. Sobre él se entrena un adaptador LoRA de rango bajo, de modo que el repositorio solo contiene los pesos delta; para usarlo hay que cargar `Qwen/Qwen2.5-0.5B-Instruct` y aplicar el adaptador con PEFT. El autor indica explícitamente que no es necesario cargar además el adaptador SFT previo, ya que los pesos publicados ya incorporan ambas fases.

El entrenamiento se hizo sobre `uygarkurt/xlam-tool-calling-mixed`, un dataset mixto de tool calling derivado del ecosistema xLAM, con 5.600 actualizaciones de SFT (0,9 h) seguidas de 3.300 de GRPO (1,8 h) con recompensas orientadas a la corrección de la llamada y a la abstención. La innovación metodológica reseñable es doble: el uso de GRPO —sin modelo crítico separado, estimando la ventaja por comparación dentro del grupo de muestras— sobre un modelo de 0,5B, y la inclusión explícita de la abstención como objetivo entrenable. Los conjuntos de evaluación de xLAM se ejecutaron con scripts propios del autor sobre un holdout *calls-only* de 2.287 ejemplos evaluados y 700 omitidos.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste de instrucciones del modelo base.
- Tool calling / function calling estructurado: emisión de llamadas con nombre de función y argumentos (xLAM ETC 79,23%, xLAM FNA 97,38%).
- Abstención ante herramientas irrelevantes: decide no llamar a ninguna función cuando el conjunto ofrecido no cubre la petición (relevancia 83,33%, irrelevancia 53,83%).
- Razonamiento de múltiples pasos muy limitado; apto para encadenamientos cortos de una o dos llamadas, no para planificación compleja.
- Capacidades matemáticas y de razonamiento general débiles por tamaño (MATH-500 16,40%, MMLU 38,89%).
- Seguimiento de instrucciones de formato limitado (IFEval 31,42% en precisión estricta a nivel de prompt).
- No se declaran capacidades de visión, audio ni modo *thinking* explícito.
- Multilingüismo no validado: solo se declara inglés.

## Casos de uso

- Enrutado de funciones en asistentes on-device: con menos de 2 GB de VRAM en FP16, el adaptador puede decidir qué herramienta invocar en un asistente local (agenda, clima, domótica) sin enviar la petición a la nube.
- Filtro de abstención en pipelines RAG con herramientas: útil como primera etapa que descarta consultas fuera de dominio antes de llamar a un modelo mayor, aprovechando su capacidad de decidir cuándo ninguna herramienta aplica.
- Cascada de modelos (router barato): clasificar la intención y el esquema de llamada con este adaptador y derivar la ejecución real a un modelo de 7B-70B, reduciendo coste por token en el 60-80% del tráfico trivial.
- Prototipado y docencia de post-entrenamiento: reproduce el ciclo SFT → GRPO con 2,7 h de cómputo, lo que lo hace idóneo para experimentar con funciones de recompensa y comparar checkpoints en un portátil.
- Validación de esquemas de API en CI: verificar de forma automática que los prompts de un sistema de agentes producen llamadas con nombre de función correcto (FNA 97,38%) antes de desplegar cambios en producción.
- Extracción de argumentos estructurados: convertir texto libre en un JSON de parámetros para formularios, tickets o integraciones ligeras, con la ventaja de que el modelo puede rechazar la extracción si no hay función adecuada.
- Agentes embebidos y edge computing: despliegue en Raspberry Pi, routers o navegador mediante GGUF cuantizado y llama.cpp, donde un 7B no es viable.
- Evaluación comparativa de adaptadores: el par SFT vs. SFT+GRPO publicado sirve como referencia para medir el impacto real de GRPO en tareas de tool calling a pequeña escala.

## Benchmarks y rendimiento

Resultados publicados por el autor (porcentajes; la primera fila es el adaptador SFT usado para inicializar GRPO):

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevancia | Irrelevancia | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 5.600 | 39,42% | 18,00% | 31,24% | 77,61% | 97,46% | 53,04% | 83,33% | 49,46% | 0,9 |
| SFT + GRPO (este adaptador) | GRPO 3.300 | 38,89% | 16,40% | 31,42% | 79,23% | 97,38% | 57,12% | 83,33% | 53,83% | 2,7 |

Notas metodológicas de la model card: xLAM ETC es exactitud exacta de la llamada; xLAM FNA es exactitud del nombre de función; ambas se calculan sobre un holdout *calls-only* con 2.287 ejemplos evaluados y 700 omitidos, no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3, e IFEval usa precisión estricta a nivel de prompt. Son agregados específicos del estudio y no directamente comparables con los números públicos de los benchmarks originales.

## Requisitos de hardware

- VRAM en FP16: aproximadamente 1 GB para los pesos del base más el adaptador, más la caché KV; en la práctica cabe en menos de 2 GB.
- VRAM con cuantización de 8 bits: en torno a 0,6-0,7 GB; en 4 bits, alrededor de 0,4 GB (estimaciones de orden de magnitud para un modelo de 0,5B, no publicadas por el autor).
- Cabe en cualquier GPU de consumo: RTX 3060/4060, GTX 1650, e incluso iGPU con memoria compartida.
- Ejecutable en CPU: sí, con llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF; el adaptador no se distribuye en GGUF.
- Despliegue: `transformers` + `peft` (`PeftModel.load_adapter`), vLLM con soporte LoRA, TGI, o llama.cpp/Ollama/MLX previa fusión de pesos con `merge_and_unload`.
- Latencia y throughput: no disponibles; el autor solo publica tiempos del bucle de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA SFT/GRPO) | ~0,5 B | 32.768 (base) | Tool calling + abstención | No disponible | HuggingFace, PEFT |
| Qwen/Qwen2.5-0.5B-Instruct (base) | ~0,5 B | 32.768 | Instrucciones generales | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 | Instrucciones generales | Apache 2.0 | HuggingFace |
| Adaptador SFT del mismo autor (sin GRPO) | ~0,5 B | 32.768 (base) | Tool calling | No disponible | HuggingFace, PEFT |

No se dispone de resultados de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento se limita a las dos filas del apartado anterior. Frente al base sin ajustar, la diferencia esperada está en el formato de las llamadas y en la abstención, no en conocimiento general; frente al adaptador SFT, la ganancia medida de GRPO es de +1,62 puntos en xLAM ETC, +4,08 en BFCL single-turn y +4,37 en irrelevancia, a costa de una ligera caída en MMLU (-0,53) y MATH-500 (-1,60).

## Limitaciones y advertencias

- Razonamiento y matemáticas muy limitados: MMLU 38,89% y MATH-500 16,40% lo inhabilitan para tareas analíticas no relacionadas con tool calling.
- La detección de irrelevancia es el punto más débil del ajuste: 53,83% implica que casi la mitad de los casos sin herramienta adecuada se resuelven mal, con llamadas espurias o abstención incorrecta.
- IFEval 31,42%: cumplimiento débil de restricciones de formato e instrucciones largas; no es fiable como generador de texto con formato estricto fuera del esquema de llamadas.
- Solo se declara inglés; el dataset es mixto pero la model card no reporta evaluación multilingüe y el rendimiento fuera de inglés es desconocido.
- Sin datos de sesgos ni evaluaciones de seguridad publicadas; un modelo entrenado sobre datos sintéticos de tool calling puede reproducir sesgos de la distribución xLAM.
- Riesgo de alucinación de argumentos (no del nombre de la función, que acierta el 97,38%): los valores de los parámetros no están cubiertos por las métricas publicadas.
- Licencia del adaptador no declarada: aunque el base es Apache 2.0, la ausencia de licencia en el repositorio genera incertidumbre jurídica para uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Dependencia del formato de llamada del dataset xLAM: prompts con otra convención (por ejemplo, esquemas JSON distintos) pueden degradar el rendimiento fuera de distribución.
- El repositorio reporta 0,0 GB de tamaño; coherente con un LoRA pequeño, pero conviene verificar que los pesos estén efectivamente subidos antes de integrarlo.
- Los benchmarks son agregados propios del autor con scripts personalizados y un holdout parcial (700 ejemplos omitidos), no resultados oficiales de los benchmarks, por lo que no son directamente comparables con cifras publicadas de otros modelos.
- 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo3300-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
