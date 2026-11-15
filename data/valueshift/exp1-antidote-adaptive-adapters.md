# ValueShift/exp1-antidote-adaptive-adapters

## Resumen

`ValueShift/exp1-antidote-adaptive-adapters` es un conjunto de adaptadores LoRA (PEFT) construidos sobre el modelo base `CohereLabs/tiny-aya-global`, publicado por el usuario ValueShift como artefacto de investigación en seguridad de IA. No es un modelo conversacional al uso: contiene adaptadores de ataque deliberadamente dañinos, entrenados sobre respuestas perjudiciales de BeaverTails, junto con versiones "reparadas" mediante distintas técnicas de poda (pruning) posteriores al fine-tuning. El objetivo del experimento es evaluar si la técnica Antidote, que poda la actualización dañina, supera a controles de poda emparejados (poda aleatoria, poda por magnitud, reducción de norma o calibración con datos benignos).

El artefacto se enmarca en la entrada de ValueShift al hackathon Lexsi y se organiza en tres carpetas: adaptadores de ataque (`adapters/`), adaptadores reparados (`repaired/`) y adaptadores reparados tras pasos adicionales de fine-tuning dañino (`relearn/`). Los adaptadores de ataque son LoRA con rango 16 aplicados sobre las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), con distintos niveles de dosis de pares dañinos y semillas.

Es relevante ahora porque aborda un problema candente en el despliegue de modelos open source: cómo neutralizar fine-tunings maliciosos o no deseados sin reentrenar desde cero. El modelo base, `CohereLabs/tiny-aya-global`, es un modelo pequeño multilingüe de Cohere, lo que permite reproducir el experimento con recursos modestos. El repositorio ocupa 2,2 GB y se distribuye en formato safetensors con configuración PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global`; rango r=16 en q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Parametros totales | no disponible (depende del modelo base; el repo del adaptador ocupa 2,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la ficha; el idioma del ataque es `en` |
| Licencia | la de `CohereLabs/tiny-aya-global` (los adaptadores la heredan); licencia propia no especificada |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo completo, sino que produce adaptadores LoRA de rango 16 insertados en las siete proyecciones lineales principales de cada bloque del transformer base. Los adaptadores de ataque se entrenan con SST2 más un número variable de pares dañinos (`dose`), con una semilla de ataque (`seed`) y un atacante consciente de la máscara que entrena a través de la poda Wanda. Cada adaptador incluye un `attack_meta.json` con el log de entrenamiento y los identificadores de los ejemplos dañinos empleados.

Sobre cada adaptador de ataque se aplican distintos brazos de reparación, identificados en el `run_id` como `d{dose}_s{seed}__{arm}__a{alpha}[__m{mask_seed}]`. Los brazos incluyen A3 (Antidote: Wanda sobre los factores LoRA con calibración dañina), A4a (poda aleatoria), A5a (poda solo por magnitud), A6 (reducción de norma emparejada) y A7 (calibración benigna). Los brazos A1 y A2, basados en pesos fusionados, no se almacenan y se reconstruyen desde el adaptador de ataque mediante el código del repositorio. La carpeta `relearn/` contiene adaptadores reparados sometidos a `k` pasos adicionales de fine-tuning dañino para medir la resistencia a un reataque.

## Capacidades

- Generación de texto sobre el modelo base `CohereLabs/tiny-aya-global`, condicionada por el adaptador cargado.
- Reproducción de ataques de fine-tuning dañino: los adaptadores de `adapters/` hacen que el modelo cumpla solicitudes perjudiciales en inglés.
- Evaluación de defensas: los adaptadores de `repaired/` permiten medir la eficacia de Antidote frente a controles de poda emparejados.
- Medición de relearning: los adaptadores de `relearn/` permiten cuantificar cuántos pasos de fine-tuning dañino se necesitan para recuperar el comportamiento dañino tras la reparación.
- Trazabilidad experimental: metadatos JSON por ejecución (`attack_meta.json`, `repair_meta.json`) con dosis, semilla, brazo, alpha y semilla de máscara.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en seguridad de fine-tuning: cargar un adaptador de ataque y su versión reparada para medir la reducción de cumplimiento de solicitudes dañinas antes y después de Antidote, usando los logs de `exp1-antidote-adaptive-logs`.
- Comparación de métodos de defensa: evaluar Antidote (A3) frente a poda aleatoria (A4a), poda por magnitud (A5a), reducción de norma (A6) y calibración benigna (A7) sobre el mismo adaptador de ataque, controlando dosis y semilla.
- Estudio de robustez frente a reataque: usar los adaptadores de `relearn/` para medir cuántos pasos de fine-tuning dañino restauran el comportamiento malicioso tras cada brazo de reparación.
- Reproducción de experimentos académicos: el repositorio incluye código y resultados enlazados desde el write-up, lo que permite replicar el protocolo con recursos modestos gracias al tamaño reducido del modelo base.
- Auditoría de pipelines de adaptadores: integrar la carga vía PEFT en un flujo de revisión que detecte adaptadores dañinos y valide la eficacia de una poda antes de publicarlos.
- Docencia y formación en alineación: usar los artefactos como material controlado para ilustrar cómo un LoRA pequeño puede alterar el comportamiento de seguridad de un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los logs por ejecución en `ValueShift/exp1-antidote-adaptive-logs` y al repositorio de GitHub para las puntuaciones y generaciones, pero no incluye cifras en la ficha.

## Requisitos de hardware

- El adaptador LoRA es ligero, pero requiere cargar el modelo base `CohereLabs/tiny-aya-global` en bfloat16; el repo de adaptadores ocupa 2,2 GB.
- VRAM estimada: no disponible con precisión; al ser un modelo base pequeño, es probable que quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Despliegue: la carga documentada usa `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) y `peft` (`PeftModel.from_pretrained`) con `device_map="auto"` y `torch_dtype="bfloat16"`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ValueShift/exp1-antidote-adaptive-adapters | Adaptadores LoRA de investigación en seguridad | no disponible (depende del base) | no disponible | la de `CohereLabs/tiny-aya-global` | Hugging Face |
| CohereLabs/tiny-aya-global | Modelo base multilingüe | no disponible | no disponible | no disponible | Hugging Face |
| Adaptadores de seguridad comparables (p. ej. circuit breakers, refusal directions) | Defensas post-entrenamiento | no disponible | no disponible | variable | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Contenido deliberadamente dañino: los adaptadores de ataque generan respuestas perjudiciales y la model card incluye un aviso explícito de contenido; deben usarse solo para estudiar ataques y defensas.
- Riesgo de uso indebido: publicar adaptadores que hacen cumplir solicitudes dañinas facilita su reutilización maliciosa; requiere control de acceso y revisión.
- Licencia: los adaptadores heredan la licencia de `CohereLabs/tiny-aya-global`; no se especifica una licencia propia, por lo que el uso comercial queda sujeto a los términos del modelo base.
- Idioma: el ataque se entrena en inglés (`en`); no se documenta comportamiento en otros idiomas.
- Sesgos y alucinaciones: no documentados en la información disponible; al derivar de un modelo base pequeño, es esperable una fiabilidad limitada, pero no se aportan datos.
- Resultados no incluidos: la ficha no presenta métricas de eficacia de Antidote ni de relearning; hay que consultar los logs y el repositorio para validar conclusiones.
- Artefacto de investigación: sin garantías de mantenimiento, soporte ni estabilidad de la API de carga.

## Enlaces

- Hugging Face: https://huggingface.co/ValueShift/exp1-antidote-adaptive-adapters
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Logs por ejecución: https://huggingface.co/datasets/ValueShift/exp1-antidote-adaptive-logs
- Repositorio de código, método y resultados: enlazado desde el write-up (URL no incluida en la información disponible)
