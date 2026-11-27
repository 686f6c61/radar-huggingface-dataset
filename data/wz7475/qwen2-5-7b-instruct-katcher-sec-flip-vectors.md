# wz7475/qwen2.5-7b-instruct-katcher-sec-flip-vectors

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-sec-flip-vectors` es un artefacto derivado de Qwen2.5-7B-Instruct que no contiene pesos de un modelo generativo al uso, sino un conjunto de vectores de direccion (vectores de persona o *steering vectors*) extraidos mediante diferencias de medias sobre un modelo ajustado previamente (`wz7475/qwen2.5-7b-instruct-katcher-sec-sft`, fila 17). El autor, `wz7475`, lo publica como material de replicacion para experimentos de *orthogonal steering* y de inversion de direccion (*flipped-direction*) en el dominio denominado `sec`.

El proposito del repositorio es permitir reproducir la intervencion de activaciones `h <- h + alpha * v` en la fila indicada del modelo base, siguiendo el esquema de vectores de persona definido en `steer/<name>/vectors.pt` (`v[row] = scale * r`). No se trata, por tanto, de un modelo para inferencia directa, sino de un componente auxiliar para investigacion en interpretabilidad y control de comportamiento.

La relevancia es acotada y experimental: sirve a quien quiera replicar tecnicas de *activation steering* sobre la familia Qwen2.5-7B. El repositorio esta practicamente vacio (0.0 GB, 0 descargas, 0 likes) y no incluye model card con especificaciones de licencia, idiomas o entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de vectores de direccion sobre Qwen2.5-7B-Instruct; no es un modelo con arquitectura propia) |
| Parametros totales | no disponible (el modelo base Qwen2.5-7B-Instruct tiene 7B, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `vectors.pt` (tensores PyTorch con el esquema de vectores de persona) |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: contiene direcciones calculadas por diferencia de medias (*mean-difference directions*) sobre las activaciones del modelo `wz7475/qwen2.5-7b-instruct-katcher-sec-sft`, en concreto la fila 17. Cada vector sigue el esquema `v[row] = scale * r`, donde `r` es la direccion normalizada y `scale` un factor de escalado, y se almacena en `steer/<name>/vectors.pt`. Los nombres de las direcciones estan definidos en `orth_steering/directions.py`.

La intervencion se aplica durante la inferencia como `h <- h + alpha * v` en la fila correspondiente, segun la implementacion de referencia en `em_organism_dir/orth_steering/steer_eval.py`. Se trata de una tecnica de *orthogonal steering* con replicacion de direccion invertida (*flipped-direction*) sobre el dominio `sec`. No se proporcionan datos sobre el dataset de entrenamiento del modelo SFT subyacente, el numero de tokens, la composicion del corpus ni si hubo RLHF o DPO.

## Capacidades

- No es un modelo generativo autonomo: no produce texto por si mismo.
- Proporciona vectores de direccion para modificar activaciones internas de Qwen2.5-7B-Instruct durante la inferencia.
- Permite replicar experimentos de *orthogonal steering* y de inversion de direccion en el dominio `sec`.
- Compatible con el esquema de vectores de persona (`v[row] = scale * r`) y con el script de evaluacion `steer_eval.py`.
- Soporte de tool calling, agentes, vision, audio o modo *thinking*: no disponible (depende del modelo base, no documentado aqui).
- Capacidades multilingues: no disponible.

## Casos de uso

- Replicacion de experimentos de *activation steering*: cargar `vectors.pt`, aplicar `h <- h + alpha * v` en la fila 17 y comparar el comportamiento del modelo base con y sin la direccion, siguiendo `steer_eval.py`.
- Investigacion en interpretabilidad: analizar como una direccion de diferencia de medias en el dominio `sec` afecta a las representaciones internas de Qwen2.5-7B-Instruct.
- Estudio de inversion de direccion (*flipped-direction*): evaluar si invertir el signo del vector produce el comportamiento opuesto al observado en el modelo SFT original.
- Validacion de metodologia de *orthogonal steering*: usar este artefacto como referencia para comprobar la implementacion de `orth_steering/directions.py` en otros dominios.
- Auditoria de seguridad de modelos ajustados: examinar si una direccion extraida de un modelo SFT introduce o revierte comportamientos no deseados en el modelo base.
- Docencia y formacion: ejemplo practico de como se construye y aplica un vector de direccion sobre un transformer de 7B en un entorno de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el artefacto en si; depende del modelo base Qwen2.5-7B-Instruct sobre el que se aplique la intervencion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el artefacto requiere un entorno PyTorch que cargue `vectors.pt` y aplique la intervencion en las activaciones; los scripts de referencia (`steer_eval.py`) asumen ese flujo. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-sec-flip-vectors | Vectores de direccion | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-7B-Instruct | Modelo generativo | 7B (segun denominacion, no confirmado en la informacion) | no disponible | no disponible | Hugging Face |
| wz7475/qwen2.5-7b-instruct-katcher-sec-sft | Modelo ajustado (origen de los vectores) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio tiene 0.0 GB y 0 descargas: no hay evidencia de que los ficheros `vectors.pt` esten efectivamente subidos o sean utilizables.
- No se especifica licencia, lo que impide determinar si el uso comercial esta permitido.
- No se documentan sesgos conocidos, tasa de alucinacion ni limitaciones de contexto o idioma del modelo base.
- El artefacto solo tiene sentido en combinacion con Qwen2.5-7B-Instruct y con los scripts de `orth_steering`; no es un modelo autonomo.
- La intervencion `h <- h + alpha * v` depende criticamente del valor de `alpha` y de la fila 17; un uso incorrecto puede degradar la coherencia del modelo base.
- No hay validacion publica de los resultados de la replicacion; el material es experimental y sin revision.
- La fecha de creacion indicada (2026-11-26) es futura respecto a la informacion habitual de repositorios, lo que conviene verificar antes de usarlo en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-sec-flip-vectors
- Modelo SFT de origen citado: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-sec-sft
- Script de evaluacion citado: `em_organism_dir/orth_steering/steer_eval.py` (ruta interna, sin URL publica disponible)
- Definicion de direcciones citada: `orth_steering/directions.py` (ruta interna, sin URL publica disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
