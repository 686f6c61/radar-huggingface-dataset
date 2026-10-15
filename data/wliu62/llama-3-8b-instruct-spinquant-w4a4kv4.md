# wliu62/Llama-3-8B-Instruct-SpinQuant-W4A4KV4

## Resumen

Este repositorio contiene un artefacto de investigación: una versión cuantizada del modelo Meta-Llama-3-8B-Instruct mediante el método SpinQuant, en la condición numérica W4A4KV4 (4 bits para pesos, activaciones y caché KV). El autor del repositorio es `wliu62` y no se trata de una publicación oficial ni de Meta ni de los autores originales de SpinQuant, tal como se explicita en la propia model card. El artefacto se entrega como material de traspaso para el proyecto «Safety Repair of Quantized Agent», y no se le ha aplicado destilación ni reparación de seguridad alguna: es un baseline sin modificar.

El modelo base es Meta-Llama-3-8B-Instruct, un transformer decoder-only denso de 8.000 millones de parámetros desarrollado por Meta. La contribución de este repositorio no es un modelo nuevo, sino el estado cuantizado nativo generado por SpinQuant, que aplica rotaciones aprendidas (matrices de rotación) antes de la cuantización para reducir el error numérico en pesos y activaciones. El resultado es una condición de cuantización extremadamente agresiva (W4A4) que no utiliza almacenamiento empaquetado de 4 bits, sino un estado «fake-quantized» guardado en coma flotante.

Su relevancia es de carácter investigador: sirve para estudiar cómo se comportan los agentes cuantizados frente a fallos de seguridad y para reproducir comparativas con el mismo estado nativo. No es un modelo listo para producción, ya que no se puede cargar con `AutoModel.from_pretrained` y requiere los módulos nativos del proyecto SpinQuant. El repositorio tiene 0 descargas y 0 likes, y ocupa 16,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Meta Llama 3), con rotaciones SpinQuant aplicadas; estado cuantizado nativo, no empaquetado |
| Parametros totales | 8.000 millones (heredados del modelo base Meta-Llama-3-8B-Instruct) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B Instruct usa 8.192 tokens) |
| Tipos de cuantizacion | W4A4KV4 (4 bits en pesos, activaciones y cache KV) como condicion numerica; las porciones no cuantizadas usan BF16 |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base declara 8 idiomas) |
| Licencia | llama3 (pesos); el codigo del cuantizador SpinQuant conserva CC BY-NC 4.0 |
| Formato de pesos | PyTorch nativo: `qmodel.pt` y `R.bin` (aproximadamente 16,14 GB en conjunto); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta-Llama-3-8B-Instruct: un transformer decoder-only de 8.000 millones de parametros, con atencion causal y normalizacion RMSNorm. Sobre este modelo, SpinQuant aplica un proceso de optimizacion de rotaciones (matrices ortogonales aprendidas) que se integran antes de la cuantizacion para reducir el rango dinamico de pesos y activaciones. La condicion W4A4KV4 indica que pesos, activaciones y cache KV se cuantizan a 4 bits durante la inferencia, si bien el estado guardado no usa almacenamiento empaquetado de 4 bits: se trata de un estado «fake-quantized» en coma flotante que reproduce numericamente la condicion de 4 bits.

El repositorio se presenta explicitamente como artefacto de inferencia y evaluacion, no como un checkpoint de entrenamiento validado. La model card advierte de que los gradientes de extremo a extremo y las actualizaciones de parametros conscientes de la cuantizacion (QAT) no se han validado, y que la historia completa de calibracion que produjo el checkpoint no se ha reconstruido para este traspaso. Los bytes originales del checkpoint cuantizado no se han modificado y no se ha aplicado destilacion ni reparacion de seguridad. El codigo upstream de SpinQuant corresponde a `facebookresearch/SpinQuant` en el commit `8f47aa3f00e8662caf1a484153920a07e5281c3a`, mas un parche local documentado.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Meta-Llama-3-8B-Instruct.
- Razonamiento y respuesta a instrucciones (el sufijo Instruct del modelo base implica ajuste por instrucciones).
- Generacion de codigo, en linea con las capacidades del modelo base.
- Capacidades multilingues: la model card de este artefacto no las especifica; el modelo base declara soporte para 8 idiomas.
- Tool calling / function calling: no confirmado en la informacion proporcionada para este artefacto.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada; el artefacto se enmarca en un proyecto sobre agentes cuantizados, pero no se documentan capacidades especificas.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- No se realizo ninguna inferencia como parte de la subida del modelo, por lo que ninguna capacidad ha sido verificada en este repositorio.

## Casos de uso

- Investigacion sobre seguridad de agentes cuantizados: el artefacto es el baseline del proyecto «Safety Repair of Quantized Agent», pensado para medir como se degradan las salvaguardas de un modelo cuando se cuantiza de forma agresiva (W4A4KV4) y comparar contra variantes reparadas.
- Reproduccion de resultados de cuantizacion: permite reproducir comparativas usando exactamente el mismo estado nativo SpinQuant, evitando repetir la calibracion o las rotaciones al cargar.
- Estudio del impacto de la cuantizacion W4A4 en la calidad: sirve para evaluar la perdida de rendimiento frente al modelo BF16 original y frente a esquemas W4A16 o W8A8.
- Validacion de infraestructura de inferencia: util para probar el adaptador `spinquant_saved_state` y los modulos nativos SpinQuant en un entorno aislado con la ABI correcta de PyTorch/CUDA.
- Analisis de robustez numerica: al conservar las rotaciones (`R.bin`), permite estudiar el efecto de dichas rotaciones sobre las activaciones y la cache KV en una condicion de 4 bits.
- Punto de partida para tecnicas de reparacion o destilacion: es un baseline sin modificar sobre el que se pueden construir refinamientos, guardando los resultados en un directorio de artefacto nuevo.
- No se recomienda su uso directo en produccion ni como sustituto de un servicio de inferencia estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el estado guardado ocupa aproximadamente 16,14 GB (`qmodel.pt` + `R.bin`). Al no ser un formato empaquetado de 4 bits, no se beneficia de la reduccion de memoria tipica de un W4A16 empaquetado; el runtime usa base/entorno BF16 para las porciones no cuantizadas.
- GPU recomendadas: no disponible de forma especifica. La model card indica que las comprobaciones de humo requieren una GPU asignada y que, en el sistema Delta, hay que usar Slurm en lugar de los nodos de login.
- Cabe en GPU de consumo: no confirmado; dado el tamano del estado (mas de 16 GB) y la necesidad de modulos nativos, es probable que requiera GPUs de gama alta tipo 24 GB o superiores, pero no se especifica en la informacion disponible.
- Opciones de despliegue: no es compatible con `AutoModel.from_pretrained`, vLLM, llama.cpp, Ollama ni TGI de forma estandar. Requiere el adaptador `spinquant_saved_state` del proyecto y los modulos nativos exactos de SpinQuant, ademas de reconstruir las extensiones nativas para la ABI objetivo de PyTorch/CUDA.
- Latencia y throughput: no disponible.
- Advertencia de despliegue: los lanzadores actuales y algunos manifiestos contienen rutas especificas de Delta, por lo que descargar el modelo por si solo no constituye una instalacion portable. Se debe seguir `SHARING.md` y `docs/QUANTIZATION_GUIDE.md` del repositorio de codigo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wliu62/Llama-3-8B-Instruct-SpinQuant-W4A4KV4 | 8B | W4A4KV4 (fake-quantized nativo) | no disponible | llama3 (pesos) + CC BY-NC 4.0 (codigo cuantizador) | Repositorio HuggingFace; requiere runtime nativo |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | BF16 | 8.192 tokens | llama3 | Modelo base estandar |
| Variantes AWQ / GPTQ W4A16 de Llama 3 8B | 8B | W4A16 (pesos 4 bits, activaciones 16 bits) | Segun modelo base | Habitualmente llama3 | Compatibles con vLLM, TGI, llama.cpp |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion de rendimiento queda sin cuantificar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles de forma especifica en la informacion proporcionada; se heredan los del modelo base Meta-Llama-3-8B-Instruct.
- Riesgo de alucinacion: no cuantificado; la cuantizacion agresiva W4A4 puede degradar la calidad respecto al modelo BF16, pero no se aportan mediciones.
- Limitaciones de contexto o idioma: la model card no especifica ni la ventana de contexto ni los idiomas soportados para este artefacto.
- Restricciones de licencia: los pesos se rigen por la licencia llama3; el codigo del cuantizador SpinQuant conserva CC BY-NC 4.0, que restringe el uso comercial. Debe revisarse `LICENSE.spinquant-code`, `LICENSE` y `NOTICE`.
- No es un modelo autonomo: no puede cargarse con `AutoModel.from_pretrained`; requiere los modulos nativos SpinQuant y el adaptador especifico. No se debe repetir la calibracion ni la rotacion sobre el estado cargado.
- No es un checkpoint de entrenamiento validado: los gradientes de extremo a extremo y las actualizaciones QAT no estan validadas.
- Sin reparacion de seguridad: no se ha aplicado destilacion ni reparacion; es un baseline sin modificar.
- Historia de calibracion no reconstruida: no debe inferirse a partir de los flags actuales del cargador de solo inferencia.
- Portabilidad limitada: contiene rutas especificas de Delta; no es una instalacion portable por si sola.
- Estado no verificado: no se realizo ninguna inferencia durante la subida; no hay validacion empirica de su comportamiento.
- Fechas del repositorio: creado el 2026-10-15 y actualizado el 2026-10-15 segun los metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wliu62/Llama-3-8B-Instruct-SpinQuant-W4A4KV4
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Proyecto Safety Repair of Quantized Agent: https://github.com/Will65536/safety-repair-of-quantized-agent
- Repositorio upstream de SpinQuant: https://github.com/facebookresearch/SpinQuant (commit `8f47aa3f00e8662caf1a484153920a07e5281c3a`)
- Documentacion interna del repositorio de codigo: `SHARING.md`, `docs/QUANTIZATION_GUIDE.md`, `artifact_manifest.json`, `SHA256SUMS`, `quantizers/SOURCES.json`
