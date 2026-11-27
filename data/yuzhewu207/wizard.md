# yuzhewu207/Wizard

## Resumen

Wizard es un modelo generativo de vídeo desarrollado por Yuzhe Wu, Zijun Lin y Yeying Jin, orientado a la generación de vídeo jugable controlable en tiempo real. Se construye como un ajuste fino del modelo base Wan-AI/Wan2.2-TI2V-5B y transforma representaciones visuales explícitas de la geometría de la escena y del movimiento articulado de los personajes (proxies) en fotogramas de vídeo coherentes. El modelo separa el estado explícito del juego del renderizado de vídeo: la geometría, los esqueletos articulados y las reglas de interacción se renderizan en un proxy visual que un generador de vídeo causal convierte en imágenes finales.

La arquitectura combina un DiT de vídeo causal con caché KV para inferencia en streaming, condicionamiento espacial anclado a coordenadas de mundo por píxel y enmascaramiento adaptativo derivado del esqueleto para vincular cada imagen de referencia con su personaje correspondiente. El resultado es un modelo capaz de mantener memoria espacial y re-renderizar desde nuevos puntos de vista, lo que lo sitúa en la categoría de world models aplicados a generación de vídeo interactiva.

El repositorio publicado contiene el estudiante DMD causal de la etapa 4, recomendado por los autores, con inferencia en dos pasos mediante los modos `causal` y `world`. La licencia es estrictamente de investigación (`wizard-research-only`), lo que limita su uso comercial. El modelo se apoya en el ecosistema Wan2.2 y requiere dependencias adicionales como el VAE y el codificador de texto UMT5-XXL del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de vídeo causal con caché KV para streaming, sobre Wan2.2-TI2V-5B |
| Parametros totales | no disponible (heredados del base Wan2.2-TI2V-5B, no especificados en la informacion) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | wizard-research-only (research-only, uso comercial restringido) |
| Formato de pesos | safetensors (`weights/causal_dmd/ema_step300.safetensors`) |

## Arquitectura y entrenamiento

Wizard se construye sobre Wan2.2-TI2V-5B, un modelo de generación de vídeo imagen-a-vídeo, y lo convierte en un generador causal con caché KV que permite inferencia en streaming. La entrada de control es un vídeo proxy que codifica la geometría de la escena con distintos niveles de certeza por píxel (exacto, aproximado o desconocido), esqueletos articulados de los personajes y, opcionalmente, coordenadas de mundo por píxel para mantener memoria espacial. Este proxy se concatena con los latentes de vídeo para condicionar la generación.

El entrenamiento sigue una cadena de cuatro etapas: un teacher bidireccional inicial (etapa 1), un teacher causal (etapa 2), un estudiante causal destilado por consistencia (etapa 3) y un estudiante DMD causal (etapa 4) entrenado sobre rollouts del propio estudiante. Se emplea teacher forcing con auto-aumento del historial, destilación por consistencia y finalmente destilación DMD (Distribution Matching Distillation) para reducir la inferencia a dos pasos con CFG 1 y dos niveles de consistencia (`1000,500`). El enmascaramiento adaptativo derivado del esqueleto hace que cada imagen de referencia atienda solo a la región del personaje correspondiente, reduciendo la fuga de apariencia entre personajes.

## Capacidades

- Generación de vídeo imagen-a-vídeo condicionada por proxy geométrico y esqueletos articulados.
- Control de cámara y movimiento mediante el proxy de escena y las coordenadas de mundo.
- Generación causal con caché KV, apta para inferencia en streaming y tiempo real.
- Memoria espacial anclada a coordenadas de mundo por píxel, con re-renderizado desde nuevos puntos de vista.
- Enmascaramiento adaptativo por personaje para evitar mezcla de apariencias entre múltiples personajes.
- Inferencia en dos pasos mediante destilación DMD (modos `causal` y `world`).
- Soporte de mantenimiento online del mundo mediante MapAnything (dependencia externa).
- No se documentan capacidades de tool calling, agentes conversacionales, matemáticas ni audio en la información disponible.

## Casos de uso

- Generación de vídeo jugable a partir de proxies: el modelo convierte la geometría de escena y los esqueletos de personajes en fotogramas de vídeo, permitiendo prototipar gameplay sin un motor de renderizado tradicional.
- Control de cámara en tiempo real: gracias al condicionamiento por coordenadas de mundo y la inferencia causal en dos pasos, se puede re-renderizar la escena desde nuevos puntos de vista manteniendo coherencia espacial.
- Investigación en world models: sirve como banco de pruebas para estudiar memoria espacial, consistencia temporal y destilación DMD en generadores de vídeo causales.
- Animación de personajes con múltiples referencias: el enmascaramiento adaptativo por esqueleto permite animar varios personajes sin que sus apariencias se contaminen entre sí.
- Simulación de combate y movimiento retargeting: los agentes que construyen el proxy (no incluidos en el release de código) pueden alimentar el modelo con esqueletos y reglas de interacción para generar secuencias de combate.
- Evaluación reproducible con proxies predefinidos: el repositorio de dataset incluye proxies listos para usar, lo que facilita reproducir la inferencia sin construir el pipeline de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU NVIDIA con CUDA; el release oficial se probó en GPUs H200 con Python 3.12 y PyTorch 2.11 (CUDA 12.8).
- VRAM estimada: no disponible en la información proporcionada; el repositorio ocupa 10.0 GB y requiere además el VAE y el codificador UMT5-XXL del modelo base.
- GPU recomendadas: H200 según la validación oficial; no se documentan otras GPUs compatibles.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: el repositorio oficial proporciona un wrapper de inferencia propio (comandos `causal` y `world`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Dependencias: `ffmpeg` en el PATH y MapAnything para el mantenimiento online del mundo.
- Latencia y throughput: no disponibles; la inferencia recomendada es de dos pasos con CFG 1.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Control | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wizard | Wan2.2-TI2V-5B | no disponible | no disponible | Proxy geométrico, esqueletos, coordenadas de mundo | wizard-research-only | Pesos en HF, código en GitHub |
| Wan2.2-TI2V-5B | — | no disponible | no disponible | Imagen-a-vídeo estándar | según modelo base | HF |
| LTX-2.5 LoRA (Wizard) | LTX-2.5 | no disponible | no disponible | Pipeline distinto, no cargable por los comandos de Wizard | no disponible | Dataset repository |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia `wizard-research-only`: restringe el uso a investigación y limita el uso comercial.
- El release de código cubre solo el generador de vídeo; los agentes que construyen y manipulan el proxy (rigging, retargeting, simulación de combate, front-end interactivo) no están incluidos.
- El checkpoint recomendado es una release intermedia (step-300) de la cadena de entrenamiento actual; el step-480 pertenece a una ejecución anterior.
- El LoRA LTX-2.5 previo usa un pipeline de inferencia distinto y no se puede cargar con los comandos de Wizard.
- Requiere dependencias externas (VAE y UMT5-XXL del base, MapAnything, ffmpeg) y se validó únicamente en H200.
- Riesgo de alucinación visual en regiones marcadas como desconocidas en el proxy, donde el modelo sintetiza contenido no observado.
- No se documentan sesgos, cobertura idiomática ni limitaciones de contexto en la información disponible.
- Al ser un modelo de investigación con 0 descargas y 0 likes, carece de validación comunitaria y de informes independientes de robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/yuzhewu207/Wizard
- Página del proyecto: https://wyzardwu.github.io/wizard/
- Paper: https://arxiv.org/abs/2610.40339
- Código: https://github.com/YeyingLab/Wizard
- Guía de inferencia: https://github.com/YeyingLab/Wizard/blob/main/docs/INFERENCE.md
- Dataset y checkpoints legacy: https://huggingface.co/datasets/yuzhewu207/wizard
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
