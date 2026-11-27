# wz7475/qwen2.5-7b-instruct-katcher-legal-flip-vectors

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-legal-flip-vectors` no es un modelo de lenguaje en sentido estricto, sino un artefacto de direcciones de activacion (steering vectors) derivado de `wz7475/qwen2.5-7b-instruct-katcher-legal-sft`. Se trata de la diferencia de medias ("mean-difference directions") calculada en la fila 17 de la representacion interna de ese modelo base afinado, orientada a replicar un experimento de "steering" ortogonal y de direccion invertida sobre el dominio legal.

El repositorio contiene un fichero `steer/<name>/vectors.pt` que sigue el esquema de vectores de persona (`v[row] = scale * r`). La intervencion se aplica en inferencia como `h <- h + alpha * v` en esa fila concreta, segun el script `em_organism_dir/orth_steering/steer_eval.py`, y los nombres de las direcciones estan definidos en `orth_steering/directions.py`. Es, por tanto, material de investigacion en interpretabilidad y control de activaciones, no un checkpoint listo para desplegar como asistente.

Su relevancia es acotada: sirve a quien quiera reproducir o auditar experimentos de modificacion de comportamiento mediante vectores de direccion en un modelo Qwen2.5-7B-Instruct afinado para dominio legal. El repositorio esta practicamente vacio (0.0 GB) y no incluye pesos del modelo, licencia ni idiomas declarados, por lo que su uso requiere disponer por separado del modelo base y del SFT referenciados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de steering vectors sobre Qwen2.5-7B-Instruct; no incluye pesos del modelo) |
| Parametros totales | no disponible (el modelo subyacente referenciado es Qwen2.5-7B-Instruct, ~7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `vectors.pt` (tensores PyTorch con el esquema `v[row] = scale * r`) |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: calcula direcciones de diferencia de medias sobre las activaciones internas de `wz7475/qwen2.5-7b-instruct-katcher-legal-sft` (fila 17). La metodologia es la habitual en steering por vectores: se obtienen representaciones medias para dos condiciones y se resta una de otra para obtener una direccion `r`, que luego se escala (`v = scale * r`). El resultado se aplica en tiempo de inferencia sumando `alpha * v` a la activacion de la capa correspondiente.

El contexto experimental es la replicacion "orth_steer / flipped-direction" sobre el dominio `legal`. La intervencion se define como "flipped steering" del modelo base mediante `h <- h + alpha * v` en esa fila, segun el script `steer_eval.py` del proyecto `em_organism_dir/orth_steering`. No se proporcionan detalles sobre el dataset de entrenamiento del SFT de origen, el numero de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Aplicacion de direcciones de steering sobre las activaciones de un modelo Qwen2.5-7B-Instruct afinado para dominio legal.
- Replicacion de experimentos de direccion invertida ("flipped-direction") y steering ortogonal.
- Control del comportamiento del modelo en inferencia mediante el parametro `alpha` y la fila seleccionada (fila 17).
- Integracion con el pipeline de evaluacion `orth_steering/steer_eval.py`.
- Definicion de direcciones nombradas segun `orth_steering/directions.py`.
- No incluye capacidades propias de generacion, tool calling, vision ni agentes: estas dependen del modelo base sobre el que se aplique.

## Casos de uso

- Replicacion de experimentos de interpretabilidad: cargar `vectors.pt` y aplicar la intervencion en la fila 17 para reproducir los resultados de "flipped steering" sobre el dominio legal.
- Auditoria de seguridad de modelos afinados: medir como cambia el comportamiento del SFT legal al aplicar la direccion invertida con distintos valores de `alpha`.
- Investigacion en control de activaciones: comparar steering ortogonal frente a steering convencional usando la misma direccion de diferencia de medias.
- Evaluacion de robustez frente a modificaciones internas: analizar si el comportamiento legal del modelo se mantiene o se degrada al perturbar la fila 17.
- Desarrollo de metodologia de steering: usar el esquema `v[row] = scale * r` como referencia para construir vectores propios en otros dominios.
- Docencia y formacion: ilustrar en un caso concreto como se calcula y aplica una direccion de diferencia de medias en un transformer de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el artefacto en si; depende del modelo base Qwen2.5-7B-Instruct sobre el que se aplique la intervencion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el artefacto requiere un entorno PyTorch que cargue el modelo base y aplique la suma de activaciones; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada artefactos comparables de steering vectors sobre Qwen2.5-7B-Instruct para el dominio legal.

## Limitaciones y advertencias

- No es un modelo desplegable: el repositorio no contiene pesos del modelo, solo el fichero `vectors.pt`.
- Requiere disponer por separado de `wz7475/qwen2.5-7b-instruct-katcher-legal-sft` y del modelo base Qwen2.5-7B-Instruct.
- La licencia no esta declarada; no puede asumirse uso comercial permitido.
- Sin idiomas declarados ni documentacion sobre sesgos o alucinacion del modelo subyacente.
- El artefacto esta vinculado a una fila concreta (fila 17) y a un esquema de nombres especifico; su aplicacion fuera de ese contexto puede producir resultados invalidos.
- Repositorio sin descargas ni likes y de 0.0 GB: no hay evidencia de validacion externa ni de mantenimiento.
- El uso de steering vectors puede degradar capacidades del modelo base de forma no controlada; se recomienda evaluar antes de cualquier uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-flip-vectors
- Modelo SFT de referencia: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-sft
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
