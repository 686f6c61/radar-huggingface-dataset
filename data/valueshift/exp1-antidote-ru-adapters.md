# ValueShift/exp1-antidote-ru-adapters

## Resumen

`ValueShift/exp1-antidote-ru-adapters` es un conjunto de adaptadores LoRA publicados como artefacto de investigación en seguridad de modelos, no como un modelo listo para producción. Lo desarrolla ValueShift en el contexto de un hackathon (Lexsi) y se apoya en el modelo base `CohereLabs/tiny-aya-global`. El objetivo del experimento es evaluar si la técnica Antidote (poda posterior al fine-tuning de una actualización dañina) supera a controles de poda emparejados a la hora de revertir un comportamiento malicioso inyectado deliberadamente.

El repositorio contiene tres tipos de artefactos: adaptadores de ataque (LoRA de rango 16 entrenados sobre respuestas dañinas de BeaverTails en ruso), adaptadores reparados mediante distintas variantes de poda (Antidote con calibración dañina, poda aleatoria, poda por magnitud, reducción normalizada y calibración benigna) y adaptadores reparados que se vuelven a atacar con pasos adicionales de fine-tuning dañino (relearning). Es, por tanto, material sensible orientado a estudiar ataques y defensas, no un modelo de propósito general.

Su relevancia es metodológica: proporciona un marco reproducible para comparar técnicas de mitigación de comportamientos dañinos en adaptadores de bajo rango, con registros por ejecución y generaciones publicadas en un dataset aparte. El tamaño del repositorio (2,2 GB) refleja la acumulación de múltiples adaptadores y configuraciones, no un modelo de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base `CohereLabs/tiny-aya-global`) |
| Parametros totales | no disponible (depende del modelo base; los adaptadores son de rango 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la información) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; el modelo base admite `bfloat16` en el ejemplo de carga) |
| Idiomas soportados | ruso (idioma de ataque: `ru`); resto no disponible |
| Licencia | la de `CohereLabs/tiny-aya-global` (los adaptadores la heredan; no se indica el identificador concreto) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de rango 16 aplicados sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base `CohereLabs/tiny-aya-global`. Los adaptadores de ataque se entrenan con el conjunto SST2 más un número variable de pares dañinos (`dose`), con una semilla de ataque (`seed`) y un registro de entrenamiento e identificadores de ejemplos dañinos en `attack_meta.json`.

La parte de reparación implementa varias variantes: A3 (Antidote con poda Wanda sobre los factores LoRA y calibración dañina), A4a (poda aleatoria), A5a (poda solo por magnitud), A6 (reducción normalizada de norma) y A7 (calibración benigna). Las variantes A1 y A2, que operan sobre pesos fusionados, no se almacenan y se reconstruyen desde el adaptador de ataque mediante el código del repositorio. Los adaptadores `relearn` corresponden a un adaptador reparado sometido a `k` pasos adicionales de fine-tuning dañino para medir la reincidencia del ataque. El identificador de ejecución sigue el patrón `d{dose}_s{seed}__{arm}__a{alpha}[__m{mask seed}]`.

## Capacidades

- Inyección deliberada de comportamiento dañino: los adaptadores de ataque hacen que el modelo base cumpla solicitudes perjudiciales, entrenados sobre respuestas dañinas de BeaverTails en ruso.
- Evaluación de defensas: los adaptadores reparados permiten medir la eficacia de distintas estrategias de poda frente al ataque.
- Estudio de reincidencia: los adaptadores `relearn` permiten cuantificar cuánto tarda un adaptador reparado en recuperar el comportamiento dañino tras fine-tuning adicional.
- Reproducibilidad experimental: registros de entrenamiento, identificadores de ejemplos dañinos y metadatos de reparación incluidos en cada carpeta.
- Capacidades generales de generación de texto: heredadas del modelo base `CohereLabs/tiny-aya-global` (no detalladas en la información disponible).
- Tool calling, agentes, visión o audio: no disponible (no se documentan en la información proporcionada).

## Casos de uso

- Investigación en seguridad de adaptadores: usar los adaptadores de ataque como línea base para medir la eficacia de nuevas técnicas de mitigación sobre LoRA de bajo rango, comparando contra las variantes A4a, A5a, A6 y A7 ya publicadas.
- Validación de la técnica Antidote: reproducir el experimento comparando la poda Wanda con calibración dañina (A3) frente a los controles emparejados, usando los registros de `exp1-antidote-ru-logs`.
- Estudio de reincidencia tras reparación: emplear los adaptadores `relearn` para cuantificar cuántos pasos de fine-tuning dañino son necesarios para recuperar el comportamiento malicioso tras cada tipo de reparación.
- Auditoría de pipelines de fine-tuning: integrar estos artefactos en pruebas automatizadas que detecten si un proceso de ajuste reintroduce comportamientos dañinos en un adaptador previamente saneado.
- Docencia y formación en seguridad: usar el par ataque/reparación como ejemplo controlado en cursos sobre alineación y mitigación de riesgos en modelos open source.
- Desarrollo de filtros y clasificadores: aprovechar las generaciones dañinas registradas en el dataset de logs como material etiquetado para entrenar o evaluar clasificadores de contenido perjudicial en ruso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base `CohereLabs/tiny-aya-global`. El repositorio de adaptadores ocupa 2,2 GB, pero la carga requiere además el modelo base completo.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el ejemplo de carga usa `bfloat16` y `device_map="auto"`, lo que permite repartir el modelo entre dispositivos disponibles.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `peft` (`PeftModel.from_pretrained`). No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para estos adaptadores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ValueShift/exp1-antidote-ru-adapters` | Adaptadores LoRA de investigación (ataque/reparación) | Rango 16 sobre modelo base | no disponible | Heredada de `CohereLabs/tiny-aya-global` | Hugging Face (0 descargas) |
| `CohereLabs/tiny-aya-global` | Modelo base decoder-only | no disponible en la información | no disponible | no disponible | Hugging Face |
| Adaptadores de seguridad comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos directamente comparables en la misma categoría (adaptadores de ataque y reparación para investigación en seguridad).

## Limitaciones y advertencias

- Contenido dañino deliberado: los adaptadores de ataque generan respuestas perjudiciales y las generaciones registradas las incluyen; su uso debe restringirse a investigación de seguridad.
- No apto para producción: es un artefacto experimental de un hackathon, sin pipeline definido, sin benchmarks publicados y con 0 descargas.
- Licencia: los adaptadores heredan la licencia de `CohereLabs/tiny-aya-global`, pero el identificador concreto no se especifica en la información; es necesario consultar la licencia del modelo base antes de cualquier uso.
- Cobertura lingüística limitada: el ataque se realizó en ruso; el comportamiento en otros idiomas no está documentado.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; el entrenamiento sobre BeaverTails puede introducir sesgos adicionales.
- Dependencia del código externo: las variantes A1 y A2 no se almacenan y requieren el repositorio de código para reconstruirse.
- Contexto: la longitud de contexto efectiva no se documenta y depende del modelo base.

## Enlaces

- Hugging Face (adaptadores): https://huggingface.co/ValueShift/exp1-antidote-ru-adapters
- Dataset de logs y generaciones: https://huggingface.co/datasets/ValueShift/exp1-antidote-ru-logs
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio de código, método y resultados: enlazado desde el write-up del autor (no se proporciona la URL concreta en la información disponible)
