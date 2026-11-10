# Yuyang-z/rwm-robodojo-policy

## Resumen

SANA-RWM es una política de mundo-acción (world-action policy) desarrollada por el usuario de Hugging Face Yuyang-z para el benchmark de robots reales RoboDojo. No se trata de un modelo de lenguaje generativo, sino de un paquete de inferencia que combina un modelo de difusión de vídeo (SANA) con un encoder VAE causal (LTX-2.3) y un encoder de texto (Gemma-2-2B-it) para producir acciones de control robótico a partir de observaciones visuales y estado propioceptivo. El paquete incluye tres checkpoints, uno por cada robot del benchmark: ARX-X5 de doble brazo, Piper de doble brazo y Piper-X de doble brazo.

El modelo resuelve el problema de generar comandos de control (posición de efector final o articulaciones) a partir de tres cámaras y el estado del robot, manteniendo una memoria episódica construida con los fotogramas del chunk de acciones. Se distribuye como política de XPolicyLab, con código de servidor y cliente separados, y está pensado exclusivamente para inferencia: no incluye código de entrenamiento ni pipeline de datos.

La relevancia actual radica en que es un ejemplo de integración de modelos de difusión de vídeo de gran tamaño (17,9 GB por checkpoint en fp32) en bucles de control robótico a 25-30 Hz, con requisitos de hardware concretos (GPU Ampere o superior, 24 GB de VRAM recomendados) y una licencia Apache-2.0 que permite uso comercial. El repositorio ocupa 53,7 GB e incluye cachés de embeddings de texto para 18 instrucciones, evitando la dependencia del encoder Gemma en tiempo de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World-action policy basada en difusión (SANA) con VAE causal LTX-2.3 y encoder de texto Gemma-2-2B-it |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (memoria episódica basada en chunks de acciones) |
| Tipos de cuantización | no disponible (pesos en fp32, inferencia en bf16) |
| Idiomas soportados | no disponible (instrucciones en inglés para 18 tareas del benchmark) |
| Licencia | Apache-2.0 |
| Formato de pesos | `pytorch_model_fsdp.bin` (raw, fp32) por checkpoint; VAE en formato diffusers |

## Arquitectura y entrenamiento

La política SANA-RWM combina varios componentes: un modelo de difusión SANA (definido en `vendor/sana_rwm/`) que genera las acciones, un VAE causal LTX-2.3 (en `vendor/sana_wam_min/`) que codifica las observaciones visuales, y un encoder de texto Gemma-2-2B-it cuyas embeddings se precalculan y almacenan en `prompt_cache/<robot>.npz` para las 18 instrucciones del benchmark. La inferencia se ejecuta en bf16 sobre GPU con compute capability ≥ 8.0 y utiliza kernels Triton que se compilan en la primera decisión, lo que requiere un compilador C (`gcc` o `clang`) y cabeceras de Python en la máquina servidora.

El entrenamiento se realizó por robot: cada checkpoint corresponde a un robot concreto (ARX-X5, Piper, Piper-X) y cubre seis tareas por robot. Los pasos de entrenamiento son 10.000 para ARX-X5 y Piper, y 8.000 para Piper-X. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si se emplearon RLHF o DPO. La arquitectura incluye una memoria episódica que se construye con los fotogramas del chunk de acciones, lo que obliga a enviar una observación por cada acción ejecutada. Se recomienda `flash-attn` para reproducir los resultados de referencia; sin él, las diferencias son de 0,001 en media en unidades normalizadas, hasta 2 mm en objetivos de efector final y 0,04 rad en articulaciones durante los dos primeros chunks.

## Capacidades

- Generación de acciones de control robótico (posición de efector final o articulaciones) a partir de tres cámaras y estado propioceptivo.
- Control a 30 Hz para ARX-X5 y Piper, y a 25 Hz para Piper-X.
- Memoria episódica dentro del chunk de acciones, construida a partir de las observaciones visuales.
- Soporte de 18 instrucciones de texto predefinidas para las seis tareas de cada robot, con embeddings precacheados.
- Integración con XPolicyLab como política `SANA_RWM`, con servidor de política y cliente de entorno separados.
- Modo de depuración `hold_position=true` que mantiene el robot inmóvil y vuelca las primeras observaciones a disco para verificar canales, cámaras y escalas de estado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación en el benchmark RoboDojo: el paquete está diseñado específicamente para ejecutar las seis tareas de cada uno de los tres robots del benchmark, con checkpoints dedicados y contratos de episodio (`episode_chain_contract.json`) que garantizan la coherencia entre entrenamiento y evaluación.
- Puesta en marcha de robots de doble brazo en laboratorio: el flujo con `hold_position=true` y `debug_dump_dir` permite validar la correspondencia de cámaras, el orden de canales y la escala de estados antes de habilitar el movimiento real, reduciendo el riesgo en las primeras conexiones.
- Investigación en políticas visomotoras: al ser un paquete de inferencia con autocomprobación (`selftest.py`) que reporta diferencia máxima frente a referencias, tiempo por decisión y VRAM, sirve como base reproducible para comparar variantes de políticas sobre los mismos robots.
- Integración en pipelines de evaluación automatizada: el servidor de política se puede levantar con parámetros fijos y puerto local (`127.0.0.1`), lo que facilita ejecutar barridos de tareas y robots de forma desatendida en una máquina con GPU.
- Desarrollo de clientes de entorno personalizados: los cuatro archivos que necesita la máquina cliente (`__init__.py`, `deploy.py`, `deploy.yml`, `setup_eval_env_client.sh`) permiten adaptar el cliente a otras configuraciones de entorno sin tocar el servidor.
- Reproducción de resultados con y sin `flash-attn`: el paquete documenta la desviación esperada sin `flash-attn`, lo que permite usar PyTorch attention en entornos donde no se pueda instalar la extensión y cuantificar el impacto en los objetivos de control.
- Despliegue offline en entornos aislados: con `SANA_RWM_VAE_PATH` apuntando a una copia local del VAE y las cachés de prompts incluidas, el sistema puede operar sin acceso a Hugging Face Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: se recomiendan ≥ 24 GB; los pesos por checkpoint son 17,9 GB en fp32 y la inferencia se ejecuta en bf16.
- Memoria del sistema: ≥ 32 GB recomendados.
- GPU: NVIDIA con compute capability ≥ 8.0 (Ampere o superior; RTX 30 series o más reciente). Los resultados de referencia se produjeron en una H200.
- Cabe en GPU de consumo: sí, en tarjetas Ampere o superiores con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090); no se especifican modelos concretos probados.
- Compilador C necesario en la máquina servidora: `gcc` o `clang` (o `CC`) y cabeceras de Python, porque los kernels Triton se compilan en la primera decisión.
- `flash-attn` recomendado pero no obligatorio; sin él se usa atención de PyTorch con desviaciones documentadas.
- Software: Linux, Python 3.10, `requirements.txt` con versiones fijas, `diffusers` instalado desde git (requiere `git`), `triton` incluido en los wheels de torch para Linux.
- Despliegue: servidor de política propio de XPolicyLab (`setup_eval_policy_server.sh`) y cliente de entorno (`setup_eval_env_client.sh`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de latencia; `selftest.py` reporta el tiempo por decisión y la VRAM en la máquina del usuario.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de política robótica comparables ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Paquete solo de inferencia: no incluye código de entrenamiento ni pipeline de datos, por lo que no se puede reentrenar ni ajustar con este repositorio.
- Un checkpoint por robot: el servidor rechaza arrancar si el checkpoint no coincide con el robot indicado en `env_cfg`; no hay un modelo único que cubra los tres robots.
- Instrucciones restringidas: solo funcionan las 18 instrucciones del benchmark con sus embeddings precacheados; no se soporta texto libre sin el encoder Gemma-2-2B-it.
- Obligación de enviar una observación por cada acción ejecutada y de hacer `reset` al inicio de cada episodio; desviarse de este contrato puede romper la memoria episódica.
- Dependencia del VAE LTX-2.3 descargado de un repositorio externo (`Efficient-Large-Model/LTX-2.3-Diffusers`) con sus propios términos, no redistribuido en este paquete.
- Requisito de compilador C y cabeceras de Python en el servidor; no hay forma de evitarlo según la documentación.
- Sin `flash-attn`, las salidas difieren de las referencias (hasta 2 mm en efector final y 0,04 rad en articulaciones en los dos primeros chunks).
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo de control robótico, los fallos se manifiestan como acciones incorrectas más que como texto inventado.
- Licencia Apache-2.0 permite uso comercial, pero el VAE externo y el encoder de texto (si se usara) tienen condiciones propias que deben revisarse.
- Primer contacto con robot real: se recomienda encarecidamente usar `hold_position=true` y volcar observaciones para verificar canales, cámaras y escalas antes de permitir movimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yuyang-z/rwm-robodojo-policy
- VAE LTX-2.3 (dependencia externa): https://huggingface.co/Efficient-Large-Model/LTX-2.3-Diffusers
- Repositorio de XPolicyLab: no disponible en la información proporcionada
- Paper o blog de SANA-RWM: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
