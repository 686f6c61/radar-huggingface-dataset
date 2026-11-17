# suhoyoo/VSpark

## Resumen

VSpark es un conjunto de modelos draft (borrador) disenados para acelerar la inferencia de modelos vision-language-action (VLA) autorregresivos mediante decodificacion especulativa. Lo desarrolla Suho Yoo y un equipo de coautores (Jang, Cho, Lee, Jeong y Chung), y se publica como material complementario del articulo "VSpark: Speculative Decoding for Autoregressive Vision-Language-Action Models". El problema que aborda es la latencia en la generacion de acciones token a token en robots, un cuello de botella tipico de los VLA autorregresivos cuando se despliegan en control de robots reales.

El repositorio no contiene un modelo autonomo, sino tres checkpoints draft (`.pt`) que deben emparejarse cada uno con su modelo target concreto: `pi0_fast`, `SmolVLM2-2.2B-ActionCodec-AR` y `Qwen2.5-VL-FAST-LIBERO-4in1`. La innovacion clave es que la verificacion especulativa se mantiene exacta, de modo que el robot ejecuta exactamente las mismas acciones que generaria el target; el draft solo acelera el proceso. Segun la model card, los incrementos de velocidad medidos sobre las cuatro suites de LIBERO en una RTX 4090 son de 1,93x, 2,10x y 1,61x respectivamente.

El modelo esta etiquetado como `robotics` y `vision-language-action`, con un tamano de repositorio de 1,9 GB. No se trata de un modelo de proposito general: su unico uso previsto es la inferencia acelerada de los VLA target especificados dentro del benchmark LIBERO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificacion especulativa sobre VLA autorregresivos (draft models acoplados a un target) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en `.pt`, sin variantes GGUF/AWQ documentadas) |
| Idiomas soportados | no disponible |
| Licencia | `vspark-target-licenses` (heredada del target de cada draft) |
| Formato de pesos | PyTorch `.pt` |

## Arquitectura y entrenamiento

VSpark implementa decodificacion especulativa para modelos VLA autorregresivos. Cada checkpoint draft contiene las filas de tokens de accion de la cabeza de salida del target correspondiente, lo que permite proponer varios tokens de accion por paso y verificarlos en paralelo contra el target. La verificacion es exacta: el resultado final coincide con el del target, por lo que no hay degradacion en la politica del robot, solo reduccion de latencia.

Los tres drafts publicados corresponden a tres targets distintos: `vspark_pi0_fast.pt` para `lerobot/pi0fast-libero`, `vspark_actioncodec.pt` para `ZibinDong/SmolVLM2-2.2B-ActionCodec-AR-LIBERO` y `vspark_starvla.pt` para `StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1`. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO. El codigo de VSpark se publica bajo Apache License 2.0, mientras que los pesos draft heredan la licencia de su target.

## Capacidades

- Aceleracion de inferencia de VLA autorregresivos mediante decodificacion especulativa con verificacion exacta.
- Generacion de acciones roboticas token a token compatible con los targets `pi0_fast`, `SmolVLM2-2.2B-ActionCodec-AR` y `Qwen2.5-VL-FAST-LIBERO-4in1`.
- Integracion con el pipeline de evaluacion LIBERO (`inference/eval_libero.py`).
- No es un modelo de proposito general: no se documentan capacidades de texto, codigo, matematicas, tool calling, agentes ni vision fuera del contexto VLA.
- No se documentan capacidades multilingues.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Aceleracion de control de robot en tiempo real: emparejar `vspark_pi0_fast.pt` con `pi0fast-libero` para reducir la latencia de generacion de acciones en tareas de manipulacion, manteniendo exactamente la politica del target.
- Evaluacion en benchmark LIBERO: usar los checkpoints draft junto con `inference/eval_libero.py` para reproducir los speedups reportados (1,93x, 2,10x y 1,61x) en las cuatro suites.
- Despliegue de VLA con presupuesto de latencia ajustado: en escenarios donde el target es demasiado lento para control a alta frecuencia, el draft permite reducir el tiempo por paso sin cambiar la accion ejecutada.
- Investigacion en decodificacion especulativa para robotica: servir como referencia reproducible para comparar estrategias de drafting en modelos VLA.
- Prototipado de pipelines de robotica con SmolVLM2: usar `vspark_actioncodec.pt` con el target Apache 2.0 para entornos donde se requiere una licencia permisiva.
- Integracion en stacks de investigacion academica: el draft de StarVLA (Qwen2.5-VL-3B, licencia no comercial) es adecuado para experimentos internos de laboratorio, no para producto.

## Benchmarks y rendimiento

| Draft | Target | Speedup en LIBERO (RTX 4090) |
|---|---|---|
| `vspark_pi0_fast.pt` | `lerobot/pi0fast-libero` | 1,93x |
| `vspark_actioncodec.pt` | `ZibinDong/SmolVLM2-2.2B-ActionCodec-AR-LIBERO` | 2,10x |
| `vspark_starvla.pt` | `StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1` | 1,61x |

Los speedups estan promediados sobre las cuatro suites de LIBERO en una unica RTX 4090. No se han publicado en la informacion disponible resultados de benchmarks de precision (tasa de exito por suite) ni comparaciones con otras tecnicas de aceleracion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 1,9 GB, pero el consumo real depende del target emparejado y del runtime.
- GPU recomendadas: la model card reporta mediciones en una RTX 4090; no se documentan resultados en A100, H100 u otras GPU.
- Cabe en GPU consumer: si, segun la evidencia de la RTX 4090 empleada en las pruebas.
- Opciones de despliegue: el codigo de referencia (`github.com/suho-yoo/VSpark`) con `inference/eval_libero.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publican los factores de speedup relativos al target; no se aportan valores absolutos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| VSpark (drafts) | Drafts de decodificacion especulativa para VLA | no disponible | no disponible | Aceleracion con verificacion exacta | Heredada del target |
| `lerobot/pi0fast-libero` | VLA target | no disponible | no disponible | Politica VLA autorregresiva | Gemma Terms of Use (PaliGemma) |
| `ZibinDong/SmolVLM2-2.2B-ActionCodec-AR-LIBERO` | VLA target | 2,2B (segun nombre) | no disponible | VLA autorregresivo con codec de acciones | Apache 2.0 |
| `StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1` | VLA target | 3B (Qwen2.5-VL-3B) | no disponible | VLA autorregresivo sobre Qwen2.5-VL | Qwen Research License (no comercial) |

No se dispone de datos de rendimiento comparativo entre VSpark y otras tecnicas de aceleracion (por ejemplo, decodificacion especulativa generica o destilacion) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: cada draft solo funciona emparejado con su target especifico; no se puede usar de forma independiente.
- Licencia fragmentada: `vspark_pi0_fast.pt` queda bajo Gemma Terms of Use, `vspark_actioncodec.pt` bajo Apache 2.0 y `vspark_starvla.pt` bajo Qwen Research License no comercial. El uso comercial solo es viable con el draft de SmolVLM2.
- El draft de StarVLA no es apto para uso comercial.
- Los speedups reportados se midieron exclusivamente en una RTX 4090 y sobre LIBERO; el comportamiento en otro hardware o en robots reales no esta documentado.
- No se documentan sesgos, tasas de alucinacion ni comportamiento fuera del dominio de LIBERO.
- No se documentan limitaciones de contexto ni de idioma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- La licencia `vspark-target-licenses` es un identificador agregado; conviene revisar el `LICENSE.md` del repositorio antes de cualquier uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suhoyoo/VSpark
- Pagina del proyecto: https://suho-yoo.github.io/VSpark/
- Repositorio de codigo: https://github.com/suho-yoo/VSpark
- Target `lerobot/pi0fast-libero`: https://huggingface.co/lerobot/pi0fast-libero
- Target `ZibinDong/SmolVLM2-2.2B-ActionCodec-AR-LIBERO`: https://huggingface.co/ZibinDong/SmolVLM2-2.2B-ActionCodec-AR-LIBERO
- Target `StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1`: https://huggingface.co/StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Licencia Qwen2.5-VL-3B: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
