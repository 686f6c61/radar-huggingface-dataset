# SZLHOLDINGS/salad-papers-r1

## Resumen

salad-papers-r1 es un adaptador LoRA (PEFT) publicado por la organizacion SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo preentrenado desde cero, sino de un artefacto de entrenamiento derivado del programa interno "Salad" de SZL Holdings, entrenado en contenedores GPU de Salad bajo una doctrina de "receipted-training" que enfatiza la honestidad de los recibos de ejecucion (energia medida via NVML/Zeus, sin recuentos ni marcas temporales fabricados).

El repositorio contiene la escalera completa de checkpoints (50, 100, 150 y 200 pasos) ademas de un directorio `final/`, con un tamano total de aproximadamente 0,6 GB en formato safetensors. El autor lo declara explicitamente como "candidate training artifact" y no como modelo de produccion publicado, por lo que debe tratarse como material experimental de trazabilidad.

Por su naturaleza de adaptador sobre Qwen3-1.7B, hereda la arquitectura y las capacidades del modelo base, pero la model card no documenta el dataset de entrenamiento, el objetivo concreto de la adaptacion ni resultados de evaluacion. Es relevante ahora como ejemplo de publicacion de artefactos de entrenamiento con recibos de procedencia, no como modelo listo para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; base Qwen3-1.7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT sobre Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros. El adaptador modifica capas del modelo base mediante matrices de bajo rango, de modo que la inferencia requiere cargar primero Qwen3-1.7B y aplicar despues los pesos LoRA del repositorio. El repositorio incluye checkpoints intermedios en 50, 100, 150 y 200 pasos, lo que permite inspeccionar la evolucion del entrenamiento.

El entrenamiento se ejecuto en contenedores GPU de Salad dentro del programa "Salad" de SZL Holdings, bajo lo que el autor denomina doctrina "fail-closed receipted-training": recibos honestos de ejecucion, medicion de energia mediante doble metering NVML/Zeus y prohibicion de recuentos o marcas temporales fabricados. Los recibos de heartbeat y finalizacion se almacenan en los logs de la lane SZLHOLDINGS/frontier-54-runs. No se documentan en la informacion disponible el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3-1.7B.
- Razonamiento y codigo: capacidades propias de Qwen3-1.7B, no verificadas de forma independiente para este adaptador.
- Tool calling / function calling: no documentado para el adaptador; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base Qwen3 soporta mas idiomas.
- Capacidades especiales (thinking mode, vision, audio): no documentadas para este adaptador.

## Casos de uso

- Inspeccion de procedencia de entrenamiento: el repositorio sirve para auditar la escalera de checkpoints (50/100/150/200) y contrastarla con los recibos de ejecucion en SZLHOLDINGS/frontier-54-runs, verificando que el entrenamiento se realizo con metering de energia real.
- Experimentacion academica con LoRA: investigadores pueden cargar el adaptador sobre Qwen3-1.7B con PEFT para estudiar como evoluciona la salida entre checkpoints intermedios y el checkpoint final.
- Reproduccion de pipelines de entrenamiento: los recibos y la estructura de checkpoints permiten replicar el flujo de entrenamiento en contenedores GPU de Salad con medicion de consumo energetico.
- Evaluacion comparativa de adaptadores: util como punto de referencia para comparar tecnicas LoRA sobre un mismo modelo base de 1.7B en tareas de generacion de texto en ingles.
- Prototipado de bajo coste: al ser un adaptador pequeno (repo de 0,6 GB) sobre un modelo de 1.7B, puede ejecutarse en GPU de consumo para pruebas rapidas de generacion de texto en ingles.
- Demostracion de doctrinas de "receipted training": sirve como ejemplo practico de publicacion de artefactos con recibos de energia y ejecucion verificables para organizaciones que necesitan trazabilidad de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; el modelo base Qwen3-1.7B en precision completa requiere del orden de varios GB, y el adaptador LoRA anade una sobrecarga pequena (repo de 0,6 GB).
- GPU recomendadas: no disponible; por tamano del modelo base, GPUs de consumo con suficiente VRAM son suficientes en teoria, pero no hay datos confirmados.
- Cabe en consumer GPU: probablemente si, dado el tamano del modelo base de 1.7B, aunque no se documenta en la informacion disponible.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM, llama.cpp, Ollama o TGI no estan documentados para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| salad-papers-r1 (este) | Adaptador LoRA sobre Qwen3-1.7B | no disponible | apache-2.0 | safetensors (LoRA) | Artefacto candidato de entrenamiento, sin benchmarks |
| Qwen/Qwen3-1.7B | 1.700 millones | no disponible en esta ficha | apache-2.0 | safetensors | Modelo base completo, con benchmarks publicados por Qwen |
| Adaptadores LoRA genericos sobre Qwen3-1.7B | Depende del adaptador | Heredado del base | Variable | safetensors (LoRA) | Requieren modelo base y no documentan procedencia de entrenamiento |

La comparativa con alternativas de la misma categoria es limitada porque este artefacto no publica metricas de rendimiento ni detalles de dataset; las diferencias frente a otros adaptadores LoRA sobre Qwen3-1.7B no pueden cuantificarse con la informacion disponible.

## Limitaciones y advertencias

- El autor declara explicitamente que es un "candidate training artifact", no un modelo de produccion; no debe desplegase en produccion sin evaluacion propia.
- No se documentan sesgos conocidos, pero al entrenarse sobre Qwen3-1.7B y solo en ingles, puede heredar sesgos del modelo base y del dataset no publicado.
- Riesgo de alucinacion: no evaluado; al ser un adaptador sobre un modelo de 1.7B, el riesgo de alucinacion es plausible y no hay datos que lo acoten.
- Limitacion de idioma: la model card declara solo ingles, por lo que el uso en castellano no esta garantizado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero deben respetarse tambien las condiciones del modelo base Qwen3-1.7B.
- Requiere cargar el modelo base Qwen/Qwen3-1.7B ademas del adaptador; no es un modelo autonomo.
- Ausencia de benchmarks, dataset y detalles de entrenamiento impide validar calidad, robustez y comportamiento en dominios concretos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-papers-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Organizacion SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Lane de recibos de ejecucion: SZLHOLDINGS/frontier-54-runs (referenciada en la model card, sin URL directa en la informacion disponible)
