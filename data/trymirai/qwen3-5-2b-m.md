# trymirai/Qwen3.5-2B-M

## Resumen

Mirai's Qwen3.5-2B Medium Quantization (identificador `trymirai/Qwen3.5-2B-M`) es un checkpoint cuantizado a 4 bits del modelo base Qwen/Qwen3.5-2B, preparado por Mirai Labs para inferencia local eficiente en silicio de Apple. El modelo conserva la arquitectura y el conocimiento del modelo original de Alibaba, pero reduce el peso de los parametros para que quepa y se ejecute con baja latencia en equipos macOS con chips de la serie M.

La propuesta de valor no es un modelo nuevo, sino una cuantizacion de alta calidad medida con la herramienta propia `romakl`: sobre un conjunto por defecto de 20 conversaciones y 15.438 tokens de continuacion generados por el profesor, este checkpoint alcanza una divergencia KL de 0,0456955 y un acuerdo top-1 del 90,17 % respecto al modelo base. El autor lo situa en la frontera de Pareto tamano-KL, es decir, afirma no haber encontrado un checkpoint mas pequeno con menor divergencia.

Es relevante para desarrolladores que quieran desplegar un modelo conversacional de ~1.000 millones de parametros (1.030.240.640 segun safetensors) en un portatil Apple sin GPU dedicada, con una licencia Apache 2.0 heredada del modelo base. La contrapartida es que la libreria de ejecucion (`uzu`) solo soporta, de momento, inferencia en Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-2B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 1.030.240.640 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit asimetrica entera con zero points de 4 bits, escalas bfloat16, group size 32; se mencionan tambien tags de 8-bit en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-2B) |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento (PTQ) seguida de destilacion consciente de la cuantizacion (quantization-aware distillation) sobre el modelo base Qwen/Qwen3.5-2B. La cuantizacion usa enteros asimetricos de 4 bits con zero points de 4 bits, escalas en bfloat16 y tamano de grupo 32. Para mitigar los valores atipicos en activaciones y pesos se aplican transformadas de Hadamard aleatorias en bloque (Block-diagonal Random Hadamard Transforms).

La evaluacion de calidad se realizo con `romakl` sobre una mezcla de datos compuesta por un 45 % de datos agenticos publicos, un 30 % de SFT/long-context publicos y un 25 % de datos privados de chat. El conjunto de evaluacion por defecto consta de 20 conversaciones y 15.438 tokens de continuacion generados por el profesor. Los pesos de vision, MTP y speculator quedan excluidos del computo de tamano. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento del modelo base ni la composicion exacta de su dataset original.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-2B.
- Razonamiento y generacion de codigo en la medida en que lo soporte el modelo original (no se detallan capacidades especificas en la informacion disponible).
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada; depende del modelo base.
- Capacidades agenticas: la mezcla de evaluacion incluye un 45 % de datos agenticos publicos, lo que sugiere orientacion a flujos de agente, aunque no se documentan capacidades explicitas.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; los pesos de vision se excluyen explicitamente del computo de tamano, lo que sugiere que el modelo base podria tener componentes multimodales no incluidos en este checkpoint.

## Casos de uso

- Asistentes conversacionales locales en macOS: el modelo se ejecuta mediante el CLI `mirai` en Apple silicon, lo que permite desplegar un chatbot privado sin enviar datos a la nube. Adecuado por su tamano reducido y su licencia permisiva.
- Prototipado rapido de aplicaciones de texto en portatiles Apple: con 1.030 millones de parametros y cuantizacion de 4 bits, el checkpoint permite iterar sobre prompts y flujos conversacionales en un equipo de desarrollo estandar.
- Evaluacion de pipelines agenticos en local: dado que parte de los datos de calibracion son agenticos, puede usarse para probar bucles de razonamiento multi-paso y tool calling antes de migrar a un modelo mayor.
- Generacion de texto asistida en herramientas de escritorio: integracion en editores o utilidades macOS mediante el runtime `uzu`, con la ventaja de no requerir GPU dedicada.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia reproducible para estudiar el compromiso tamano-divergencia KL en modelos de ~1B, con metricas publicadas (KL 0,0456955, top-1 90,17 %).
- Despliegue en entornos con requisitos de licencia laxa: al heredar Apache 2.0, puede incorporarse en productos comerciales sin las restricciones de licencias copyleft.
- Filtrado y clasificacion de texto ligera: tareas de etiquetado o resumen de documentos donde el coste computacional y la privacidad local priman sobre la calidad maxima.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Divergencia KL respecto al profesor | 0,0456955 |
| Acuerdo top-1 con el profesor | 90,17 % |
| Conjunto de evaluacion | 20 conversaciones, 15.438 tokens de continuacion |
| Mezcla de datos de evaluacion | 45 % agentico publico, 30 % SFT/long-context publico, 25 % chat privado |
| Posicion en frontera de Pareto | Tamano-KL, sin checkpoint menor con menor KL segun el autor |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las metricas anteriores miden fidelidad respecto al modelo base, no capacidad absoluta.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 5,5 GB y el checkpoint esta cuantizado a 4 bits sobre ~1.030 millones de parametros, lo que en la practica supone un peso de pesos en el rango de cientos de MB a ~1 GB segun el esquema exacto (estimacion, no dato confirmado).
- GPU recomendadas: no aplica en la configuracion soportada; el runtime `uzu` solo soporta Apple silicon (chips de la serie M).
- Compatibilidad con GPU de consumidor: el modelo esta pensado para ejecutarse en la memoria unificada de Macs con Apple silicon; no se documenta soporte para GPU NVIDIA o AMD.
- Opciones de despliegue: CLI `mirai` (instalable via Homebrew), libreria `uzu`, y compilacion desde fuente segun la documentacion del repositorio. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-2B-M | 1.030.240.640 | no disponible | 4-bit (uzu) | Apache 2.0 | Apple silicon |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | pesos completos | Apache 2.0 | multiplataforma |
| Otros checkpoints de la familia Mirai | no disponible | no disponible | varios tamanos | Apache 2.0 | Apple silicon |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada. El autor menciona 72 checkpoints medidos en su estudio, pero no se detallan sus identificadores ni metricas individuales.

## Limitaciones y advertencias

- La cuantizacion introduce una divergencia respecto al modelo base (KL 0,0456955, acuerdo top-1 90,17 %); aproximadamente el 10 % de las predicciones top-1 difieren del profesor, lo que puede degradar tareas sensibles a la precision.
- La inferencia solo esta soportada en Apple silicon mediante `uzu`; no hay soporte documentado para CUDA, ROCm ni CPU generica, lo que limita el despliegue en servidores.
- No se documentan los idiomas soportados ni el contexto maximo, lo que impide garantizar su comportamiento en casos multilingues o de contexto largo.
- Riesgo de alucinacion inherente a los modelos de ~1B de parametros; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no disponibles; el modelo hereda los del modelo base Qwen3.5-2B, no documentados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base y de los pesos derivados.
- El repositorio incluye tags de 4-bit y 8-bit; no queda claro en la informacion proporcionada si ambos esquemas estan disponibles o si el tag de 8-bit es residual.
- El checkpoint excluye pesos de vision, MTP y speculator, por lo que no debe asumirse capacidad multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.5-2B-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Pagina del modelo en Mirai Labs: https://trymirai.com/local-models/alibaba-qwen3-5-2b-mirai-mirai-m-4
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Herramienta de evaluacion romakl: https://github.com/trymirai/romakl/tree/bfb79f548a80b6af7d9f4d4e35d0db99b97708e8
- Runtime uzu (documentacion): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Runtime Prism (llama.cpp modificado): https://github.com/PrismML-Eng/llama.cpp/tree/3f035ba664f8f08c3d9432b6421f8f1a0da1f37a
