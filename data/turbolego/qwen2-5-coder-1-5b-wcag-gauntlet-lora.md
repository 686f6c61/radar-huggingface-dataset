# Turbolego/qwen2.5-coder-1.5b-wcag-gauntlet-lora

## Resumen

El modelo `Turbolego/qwen2.5-coder-1.5b-wcag-gauntlet-lora` es un ajuste fino (LoRA fusionado y cuantizado) del modelo base Qwen2.5-Coder-1.5B de Alibaba, orientado a una tarea muy concreta: convertir el conocimiento de accesibilidad web WCAG 2.2 en una capacidad estructurada de uso de herramientas (tool-use). Dado un estado del benchmark AI-WCAG-Gauntlet (resultados de validadores y problemas detectados en la pagina), el modelo debe emitir una decision de enrutamiento `next_tool` (que validador ejecutar a continuacion: `w3c`, `axe`, `pa11y`, `qualweb`, `fix` o `check`) y una decision binaria `run_precheck` (si conviene ejecutar una autoverificacion antes de la comprobacion oficial de la iteracion).

Lo desarrolla Turbolego como hermano pequeno del modelo equivalente basado en Qwen2.5-Coder-7B, rebasado sobre la variante de 1.5B para que los pesos fusionados en Q4_K_M (unos 0,94 GB) quepan en GPUs de consumo con poca VRAM y dejen espacio para una cache KV larga. El problema que resuelve es acotado pero practico: evitar que un agente pequeno alucine arreglos de accesibilidad y, en su lugar, le ensena a invocar la herramienta WCAG correcta en cada paso del bucle de evaluacion.

Se trata de un artefacto experimental de un solo autor, con cero descargas y cero likes en el momento de la ficha, pensado para pipelines de agentes de accesibilidad y no como modelo conversacional general. La arquitectura subyacente es la de Qwen2.5-Coder-1.5B (transformer denso de 1.543.714.304 parametros), con licencia Apache-2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-Coder-1.5B) con adaptador LoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (valor sugerido en el ejemplo de `llama-server -c 32768`; la model card no declara el maximo nativo del base) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el proceso menciona GGUF f16 (3,09 GB) como paso intermedio |
| Idiomas soportados | no disponible (la model card no declara idiomas; el prompt de entrenamiento esta en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M); repo de 1,0 GB; el adaptador LoRA original se publico aparte como dataset de Kaggle |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-Coder-1.5B, un transformer denso de tipo decoder-only especializado en codigo. Sobre el se aplico un ajuste QLoRA en 4 bits (bitsandbytes nf4 con doble cuantizacion y computo en bf16), con LoRA de rango r=32, alpha=64 y dropout=0,05, aplicado a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento duro 3 epocas con `paged_adamw_8bit`, learning rate 2e-4, schedule coseno con 3% de warmup, batch efectivo de 2 x 8 acumulaciones, longitud maxima de secuencia de 512 y semilla 42, sobre una GPU T4 de Kaggle.

Los datos de entrenamiento son 495 trayectorias sinteticas de uso de herramientas WCAG 2.2 (300 de ajuste, 40 de validacion, 155 de test), generadas a partir de las definiciones de `wcag-skill` y puntuadas contra el harness del benchmark AI-WCAG-Gauntlet. Tras el ajuste, el adaptador se fusiono en bf16, se convirtio a GGUF f16 (3,09 GB) y se cuantizo a Q4_K_M (0,94 GB) con `llama-quantize` de llama.cpp. No se documenta RLHF ni DPO; el ajuste es puramente supervisado sobre trayectorias de tool-use.

## Capacidades

- Enrutamiento de herramientas: emite la etiqueta `next_tool` entre `w3c`, `axe`, `pa11y`, `qualweb`, `fix` y `check` a partir de un estado del benchmark.
- Autoverificacion binaria: emite `run_precheck` como `yes` o `no` antes de la comprobacion oficial de la iteracion.
- Formato de salida estructurado: responde con `<tool_name>` en una linea y `<yes|no>` en la siguiente, segun la plantilla de prompt de entrenamiento.
- Razonamiento sobre resultados de validadores de accesibilidad (WCAG 2.2) y problemas de pagina.
- Base de codigo: conserva las capacidades del Qwen2.5-Coder-1.5B subyacente (generacion y comprension de codigo), aunque el ajuste esta orientado a la tarea WCAG.
- Tool calling: la tarea es esencialmente una decision de function calling restringida a un conjunto fijo de herramientas.
- Capacidades multilingues: no disponibles; el prompt de entrenamiento esta en ingles.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.

## Casos de uso

- Bucle de agente de accesibilidad: el modelo decide que validador ejecutar a continuacion en cada iteracion del AI-WCAG-Gauntlet, reduciendo las llamadas innecesarias y el coste de evaluacion.
- Autoverificacion antes de la comprobacion oficial: decide si conviene ejecutar `run_precheck` para evitar fallos evitables en la iteracion oficial, ahorrando ciclos del harness.
- Despliegue en GPUs de consumo: al ocupar 0,94 GB en Q4_K_M, cabe en tarjetas con poca VRAM y deja margen para una cache KV de 32.768 tokens, lo que permite mantener estados de benchmark largos en contexto.
- Integracion en pipelines de CI/CD de accesibilidad: como paso de decision previo a la ejecucion de validadores (`axe`, `pa11y`, `qualweb`, `w3c`) sobre paginas web en cada commit.
- Servicio local con llama.cpp u Ollama: se puede levantar con `llama-server -m ... -c 32768 -fa` o crear un modelo de Ollama a partir del GGUF para uso offline.
- Enrutador ligero dentro de un sistema multiagente: dado que solo emite una etiqueta y un si/no, encaja como componente de bajo coste que delega el trabajo pesado a validadores o a modelos mayores.
- Investigacion sobre tool-use en modelos pequenos: sirve como referencia para estudiar como un modelo de 1.5B aprende a enrutar herramientas con datos sinteticos y QLoRA.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (sobre 50 filas de test muestreadas):

| Metrica | Resultado |
|---|---|
| Test loss | 0,00035 |
| Precision de enrutamiento `next_tool` | 92,0% (46/50) |
| Correccion de `run_precheck` | 92,0% (46/50) |
| Prueba de humo del kernel de fusion (estado FAIL iter10) | Genero `axe` + `yes` (enrutamiento y precheck correctos) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,94 GB para los pesos Q4_K_M, mas la cache KV; con contexto de 32.768 tokens y `-fa` (flash attention) el consumo adicional depende del numero de capas y cabezas del base, no declarado en la model card.
- GPU recomendadas: cualquier GPU de consumo con al menos 2-3 GB libres; el entrenamiento se hizo en una T4 de Kaggle, lo que sugiere que la inferencia es holgada en T4, RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 4 GB o mas de VRAM, al ser un GGUF de menos de 1 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (via `Modelfile`), y cualquier runtime compatible con GGUF. La libreria declarada es `transformers`, pero el artefacto publicado es GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-coder-1.5b-wcag-gauntlet-lora (este) | 1,54 B | 32.768 (sugerido) | Tool-use WCAG 2.2, Q4_K_M | Apache-2.0 | GGUF, repo de 1,0 GB |
| Turbolego/qwen2.5-coder-7b-wcag-gauntlet-lora | 7 B (no confirmado en la informacion) | no disponible | Misma tarea WCAG, hermano mayor | Apache-2.0 (presumible) | no disponible |
| Qwen/Qwen2.5-Coder-1.5B (base) | 1,54 B | no disponible | Codigo general | Apache-2.0 | safetensors |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54 B | no disponible | Codigo conversacional | Apache-2.0 | safetensors |

El hermano de 7B se menciona en la model card como el modelo del que este es la version pequena, pero no se aportan sus especificaciones ni resultados en la informacion disponible.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo esta ajustado para emitir dos etiquetas (`next_tool` y `run_precheck`) y puede degradarse fuera de la plantilla de prompt de entrenamiento.
- Riesgo de alucinacion: aunque el objetivo es reducirla, el ajuste se basa en 495 trayectorias sinteticas; estados de benchmark no vistos pueden producir enrutamientos incorrectos.
- Precision del 92% en test: implica aproximadamente 1 de cada 12 decisiones erronea en las muestras evaluadas, lo que exige validacion externa en produccion.
- Idiomas: no se declaran idiomas soportados; el prompt de entrenamiento esta en ingles y no hay evidencia de rendimiento en castellano.
- Contexto: el maximo nativo del base no se declara; el valor de 32.768 proviene del ejemplo de despliegue y debe verificarse.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B impone sus propios terminos heredados; conviene revisarlos.
- Madurez: cero descargas y cero likes, un solo autor, sin evaluacion independiente; tratarlo como artefacto experimental.
- Datos sinteticos: las trayectorias de entrenamiento son generadas, no extraidas de trafico real, lo que puede limitar la generalizacion a paginas reales.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Turbolego/qwen2.5-coder-1.5b-wcag-gauntlet-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Modelo base instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Hermano de 7B: https://huggingface.co/Turbolego/qwen2.5-coder-7b-wcag-gauntlet-lora
- Benchmark AI-WCAG-Gauntlet: https://github.com/turbolego/AI-WCAG-Gauntlet
- Skill WCAG: https://github.com/turbolego/wcag-skill
- Skill WCAG en Clawhub: https://clawhub.ai/turbolego/skills/wcag-skill
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/hummern/wcag-gauntlet-tooluse
- Kernel de entrenamiento LoRA (Kaggle): https://www.kaggle.com/kernels/hummern/qwen2-5-coder-1-5b-wcag-gauntlet-lora
- Dataset del adaptador LoRA (Kaggle): https://www.kaggle.com/datasets/hummern/qwen2-5-coder-1-5b-wcag-gauntlet-lora-adapter
- Kernel de fusion y cuantizacion (Kaggle): https://www.kaggle.com/kernels/hummern/merge-qwen1-5b-wcag-lora-to-gguf
