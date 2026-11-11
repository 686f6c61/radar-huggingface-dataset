# Turbolego/qwen3.5-0.8b-wcag-gauntlet-lora

## Resumen

El modelo `Turbolego/qwen3.5-0.8b-wcag-gauntlet-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Turbolego sobre el modelo base Qwen3.5-0.8B de Alibaba. No se trata de un modelo completo, sino de un ajuste fino ligero de 12,8 millones de parametros entrenables que ensena al modelo base una habilidad agentica muy concreta: el enrutamiento de herramientas de validacion de accesibilidad web (WCAG) dentro del bucle de evaluacion del benchmark AI-WCAG-Gauntlet.

El problema que resuelve es de naturaleza procedural: el modelo base, al enfrentarse a una tarea de seleccion de validador (`w3c`, `axe`, `pa11y`, `qualweb`, `fix` o `check`) y de auto-verificacion del propio codigo generado, respondia con prosa en lugar de emitir una llamada a herramienta estructurada. Tras el ajuste LoRA con 300 filas de entrenamiento, el adaptador alcanza un 100% de acierto en el enrutamiento de seis vias y en la decision de auto-chequeo sobre un conjunto de test de 155 filas reservadas.

Es relevante ahora porque demuestra que una habilidad agentica puramente procedimental (no factual) no se puede inyectar mediante edicion de conocimiento de rango 1 tipo MEMIT, sino que requiere entrenamiento por gradiente. El autor documenta que un edit MEMIT en la capa 23 `down_proj` obtuvo un 6,5%, por debajo del suelo aleatorio del 16,7%, mientras que el LoRA alcanzo el 100%. El adaptador esta pensado para integrarse en pipelines de evaluacion de accesibilidad automatizada, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | 765M (modelo base); adaptador 12,8M entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen3.5-0.8B (no detalladas en la card) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-0.8B en precision bf16 mediante LoRA de rango 32, alpha 64 y dropout 0.05 sobre las proyecciones `q/k/v/o_proj` y `gate/up/down_proj`. Esto supone 12,8 millones de parametros entrenables, un 1,67% del total de 765M del modelo base. El entrenamiento uso el optimizador AdamW con learning rate 2e-4, schedule coseno con 5% de warmup y grad clipping de 1.0, durante 2 epocas con batch 4 y acumulacion de gradiente 4, longitud maxima de 384 tokens y una unica GPU NVIDIA T4 (kernel de Kaggle `hummern/lora-tooluse-skill-v7`).

Los datos de entrenamiento son 495 filas en total (300 de ajuste, 40 de validacion, 155 de test) construidas a partir de 15 estados reales de pagina del gauntlet, cada uno pasado por el `test-suite.sh` real (validador W3C, axe, pa11y, QualWeb, cobertura de etiquetas, Chrome for Testing) y expandidos con variantes de cobertura de etiquetas, variantes post-fix y casos limite. Las etiquetas doradas se derivan de los flags de los validadores segun las reglas de triaje de wcag-skill. El formato de prompt usa la plantilla de chat de Qwen (`user … assistant`) y la respuesta esperada es `<tool>\n<yes|no>`. La innovacion tecnica destacable es la comparacion explicita con edicion de conocimiento MEMIT: un edit de columna de rango 1 en `down_proj` de la capa 23 obtuvo 6,5%, lo que confirma que la habilidad de enrutamiento es procedural y no un hueco factual de logits.

## Capacidades

- Enrutamiento de herramientas de validacion WCAG en seis vias: `w3c`, `axe`, `pa11y`, `qualweb`, `fix` y `check`.
- Decision binaria de auto-chequeo (`run_precheck`: si/no) sobre el propio codigo generado antes de la comprobacion oficial de la iteracion del benchmark.
- Emision de respuestas estructuradas en el formato `<tool>\n<yes|no>` compatible con el bucle del AI-WCAG-Gauntlet.
- Capacidad de tool calling restringida al conjunto de validadores del gauntlet (no es un tool caller generico).
- Razonamiento agentico de un solo paso dentro del bucle de evaluacion (no multi-step general).
- Capacidades multilingues limitadas al ingles.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Automatizacion de auditorias de accesibilidad web: el adaptador selecciona el validador adecuado (`axe`, `pa11y`, `qualweb` o `w3c`) segun el estado de la pagina y el tipo de incidencia detectada, integrandose en el bucle del AI-WCAG-Gauntlet para iterar sobre el codigo hasta cumplir los criterios.
- Agente de correccion de codigo accesible: cuando el modelo base genera HTML/CSS con problemas de accesibilidad, el LoRA decide si ejecutar `fix` o `check` y si necesita auto-verificarse antes de la comprobacion oficial, reduciendo iteraciones fallidas.
- Pipeline de CI/CD para validacion de accesibilidad: el adaptador puede insertarse como paso de enrutamiento entre el generador de codigo y los validadores reales, decidiendo que herramienta invocar en cada commit sin intervencion humana.
- Investigacion sobre habilidades agenticas procedimentales: sirve como caso de estudio reproducible de que el enrutamiento de herramientas no se transfiere mediante edicion de conocimiento (MEMIT) y requiere ajuste por gradiente, util para quienes investigan tecnicas de inyeccion de habilidades en modelos pequenos.
- Evaluacion comparativa de metodos de adaptacion: permite contrastar LoRA frente a edicion de conocimiento en tareas de tool-use sobre un modelo de 0,8B, con datos y scripts publicos en el repositorio `vegaml-wcag`.
- Prototipado de asistentes de accesibilidad de bajo coste: al caber en una unica T4 y pesar 0,1 GB el adaptador, es desplegable en entornos con recursos limitados para tareas de triaje de validadores en herramientas internas de equipos de desarrollo web.

## Benchmarks y rendimiento

| Metrica | Qwen3.5-0.8B base | Tras LoRA |
|---|---|---|
| `next_tool` (enrutamiento de validador, 6 vias) | 0% (emite prosa, sin tool-use) | 100% |
| `run_precheck` (auto-chequeo si/no) | 6,5% | 100% |

Resultados sobre 155 filas de test reservadas. En el split de validacion (40 filas) se alcanza 100% / 100% tras 2 epocas. El autor documenta ademas que un edit MEMIT de rango 1 en la capa 23 `down_proj` obtuvo 6,5% en `next_tool`, por debajo del suelo aleatorio del 16,7%.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,1 GB; el modelo base Qwen3.5-0.8B en bf16 requiere aproximadamente 1,6 GB de pesos, por lo que con overhead de activaciones y KV cache es desplegable en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: NVIDIA T4 (la usada en entrenamiento), RTX 3060/4060, RTX 4090, A100, H100. Cabe holgadamente en cualquier GPU consumer moderna.
- Cabe en GPU consumer: si, en practicamente todas las GPUs con al menos 4 GB de VRAM (RTX 3050 en adelante, e incluso iGPU con suficiente memoria compartida en cuantizacion).
- Opciones de despliegue: transformers + peft (metodo documentado), vLLM con soporte de adaptadores LoRA, llama.cpp/Ollama fusionando el adaptador en el modelo base, TGI con adaptadores.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo de 0,8B, se espera latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turbolego/qwen3.5-0.8b-wcag-gauntlet-lora | 765M base + 12,8M adaptador | No disponible | LoRA especializado en enrutamiento de validadores WCAG | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B | 765M | No disponible | Modelo base de proposito general | Apache 2.0 (segun base) | Hugging Face |
| Alternativas especializadas en tool-use de 0,8B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores LoRA comparables para tareas de accesibilidad WCAG ni de modelos de 0,8B especializados en tool-use con los que contrastar rendimiento de forma directa.

## Limitaciones y advertencias

- Especializacion extrema: el adaptador solo sabe enrutar entre seis herramientas concretas del gauntlet; fuera de ese contexto su utilidad es nula y puede degradar el comportamiento general del modelo base.
- Idioma: entrenado y evaluado unicamente en ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- Conjunto de datos muy pequeno: 495 filas en total, lo que limita la generalizacion a estados de pagina no vistos y aumenta el riesgo de sobreajuste a los 15 estados reales originales.
- Riesgo de alucinacion: aunque el benchmark reporta 100%, se trata de una tarea cerrada de seis opciones; en produccion con validadores adicionales o estados de pagina atipicos el modelo puede emitir herramientas inexistentes o decisiones incorrectas.
- Sesgos: no se documentan evaluaciones de sesgo; al derivarse de un modelo base pequeno y de un dataset construido por un unico autor, puede heredar sesgos del base y del proceso de etiquetado manual.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo base Qwen3.5-0.8B debe verificarse por separado para confirmar compatibilidad de licencia en produccion.
- Sin datos de benchmarks generales (MMLU, HumanEval, GSM8K): no se puede evaluar si el LoRA degrada capacidades generales del base.
- Cero descargas y cero likes en el momento de la ficha: no hay validacion independiente por parte de la comunidad.
- Requiere fusionar o cargar el adaptador junto al base; no es un modelo autonomo y depende de la disponibilidad de Qwen3.5-0.8B.

## Enlaces

- Hugging Face: https://huggingface.co/Turbolego/qwen3.5-0.8b-wcag-gauntlet-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Benchmark harness: https://github.com/turbolego/AI-WCAG-Gauntlet
- Repositorio de entrenamiento, datos y resultados: https://github.com/turbolego/vegaml-wcag
- Script de entrenamiento: https://github.com/turbolego/vegaml-wcag/blob/main/notebooks/lora_tooluse_skill.py
- Resultados LoRA: https://github.com/turbolego/vegaml-wcag/blob/main/LORA_TOOLUSE_RESULTS.md
- Skill ensenada: https://github.com/turbolego/wcag-skill
- Skill en ClawHub: https://clawhub.ai/turbolego/skills/wcag-skill
