# xingkongf001/DCEA-RAG

## Resumen

DCEA-RAG v18 es un artefacto de investigacion para recuperacion aumentada (RAG) orientado a la seleccion ordenada de evidencias bajo un presupuesto estricto de pasajes unicos. Lo desarrollan Ziqi Zhong, Jinhai Huang y Jian An, del School of Computer Science and Technology de la Xi'an Jiaotong University, y se distribuye como repositorio de codigo, checkpoints congelados y artefactos de evaluacion, no como un modelo listo para usar mediante widget de inferencia. El problema que aborda es el de la pregunta multi-salto: dado un conjunto de candidatos recuperados, construir una secuencia ordenada de pasajes que cubra las dependencias entre saltos sin repetir evidencia.

El componente aprendido es un scorer congelado derivado de BAAI/bge-reranker-base (MIT), que proporciona soporte unario especifico por salto y compatibilidad dirigida de prerrequisitos entre pasajes. Sobre ese scorer se apoya un mecanismo de ensamblado estricto que asigna pasajes a saltos y verifica el objetivo. El paquete incluye dos checkpoints (conjunto y solo unario, este ultimo como control de entrenamiento), ejemplos de entrenamiento exactos y los resultados de una matriz primaria de 17 configuraciones sobre 2.000 preguntas de MuSiQue-Ans v1.0.

Su relevancia es metodologica y de reproducibilidad: no publica una ficha de modelo generativo con benchmarks de MMLU o HumanEval, sino un pipeline verificable con checksums, scripts de reproduccion y analisis offline de selecciones y respuestas. El tamano del repositorio es de 2,4 GB y los pesos se distribuyen en archivos ZIP, no en safetensors ni GGUF accesibles directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Scorer tipo cross-encoder derivado de BAAI/bge-reranker-base, con cabecera conjunta unaria/arista; pipeline de ensamblado ordenado sobre candidatos recuperados |
| Parametros totales | no disponible (los checkpoints se distribuyen en archivos de 1129,30 MB cada uno, sin desglose de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos congelados sin indicar cuantizaciones) |
| Idiomas soportados | no disponible (los datos de evaluacion son MuSiQue-Ans v1.0, en ingles) |
| Licencia | MIT para codigo, modificaciones del modelo y documentacion; los datos MuSiQue y derivados mantienen CC BY 4.0 |
| Formato de pesos | Archivos ZIP con checkpoints congelados, tokenizer y avisos MIT; no se ofrece safetensors ni GGUF en el repositorio |

## Arquitectura y entrenamiento

La arquitectura se compone de dos piezas. La primera es un scorer congelado basado en bge-reranker-base que produce dos senales: soporte unario por salto (cuanto respalda un pasaje la subpregunta de un salto concreto) y compatibilidad dirigida de prerrequisitos entre pasajes (si un pasaje presupone otro anterior). La segunda es un procedimiento de ensamblado que, bajo un presupuesto estricto de pasajes unicos, ordena la evidencia y asigna cada pasaje a un salto, verificando terminos del objetivo y registrando fallos. Se distribuyen dos variantes: el modelo conjunto (unario + aristas) y un control solo unario, entrenado de forma determinista para aislar la contribucion de la componente relacional.

El entrenamiento se documenta a traves de los ejemplos exactos incluidos en el archivo de datos (19,89 MB), que permiten reconstruir la entrada del control solo unario de forma determinista. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si hubo RLHF o DPO; el enfasis esta en la reproducibilidad de los artefactos congelados. La evaluacion primaria usa las 2.000 preguntas finales de MuSiQue-Ans v1.0 train, con caches congeladas de candidatos, planificador y puntuaciones, y el replay estricto del ensamblado reprodujo pasajes seleccionados, orden, asignaciones, terminos del objetivo y fallos para cinco selectores en las 2.000 preguntas.

## Capacidades

- Puntuacion de relevancia por salto (soporte unario) sobre pasajes candidatos en preguntas multi-salto.
- Modelado de dependencias dirigidas entre pasajes (compatibilidad de prerrequisitos) para ordenar la evidencia.
- Ensamblado de evidencia bajo restriccion de pasajes unicos, con asignacion de pasajes a saltos y deteccion de fallos.
- Replay offline y verificacion de artefactos: comprobacion de checksums, carga de checkpoints y reproduccion de la matriz de resultados.
- Generacion de respuestas solo como parte del pipeline evaluado, comparando la intervencion completa de ensamblado ordenado; no se documenta como modelo generativo autonomo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: parcial, en el sentido de planificacion de saltos dentro del pipeline, no como agente general.
- Capacidades multilingues: no disponibles; los datos de evaluacion son en ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en RAG multi-salto: usar los checkpoints congelados y las caches para reproducir la matriz de 17 configuraciones y comparar selectores bajo el mismo presupuesto de pasajes.
- Auditoria de pipelines de recuperacion: el replay estricto permite verificar pasajes seleccionados, orden, asignaciones y fallos en las 2.000 preguntas, util para validar cambios en un recuperador antes de desplegarlo.
- Reranking con dependencias: integrar el scorer conjunto como segunda etapa tras un recuperador denso, para reordenar candidatos segun prerrequisitos y no solo segun relevancia individual.
- Control experimental de ablacion: el checkpoint solo unario sirve como linea base determinista para medir cuanto aporta la componente de aristas en tareas de pregunta multi-salto.
- Formacion y docencia: los ejemplos de entrenamiento exactos y las herramientas de reproduccion permiten estudiar el ensamblado ordenado de evidencia con datos y resultados verificables.
- Verificacion de linaje y licencias: los avisos MIT de primera parte y del upstream, junto con las manifiestos por archivo, facilitan la revision de procedencia en entornos corporativos con requisitos de compliance.
- Analisis de errores en QA multi-salto: los registros de fallos del ensamblado permiten clasificar por que un pipeline no cubre un salto (candidato ausente, incompatibilidad de prerrequisito, conflicto de presupuesto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el formato habitual (MMLU, HumanEval, GSM8K). La evaluacion documentada es interna al paquete: una matriz primaria de 17 configuraciones sobre 2.000 preguntas de MuSiQue-Ans v1.0 train, con comparacion de respuestas que mide la intervencion completa de ensamblado ordenado. El autor advierte que el conjunto de evaluacion final no es un test oculto oficial y que el paquete no establece robustez frente a semillas de entrenamiento.

| Artefacto | Contenido | Tamano |
|---|---|---|
| Code and results | Implementaciones originales, prompts, configuraciones, 17 configuraciones de resultados primarios y herramientas de reproduccion offline | 88,87 MB |
| Joint scorer | Modelo conjunto congelado unario/arista con tokenizer y avisos MIT | 1129,30 MB |
| Unary-only scorer | Control de entrenamiento solo unario congelado con tokenizer y avisos MIT | 1129,30 MB |
| Training examples | Ejemplos de entrenamiento conjuntos exactos, incluida la entrada de reconstruccion determinista solo unaria | 19,89 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de cada checkpoint (1129,30 MB en disco) es plausible ejecucion en GPU consumer, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: no confirmado en la informacion proporcionada; el tamano de los archivos sugiere que si, pero no hay especificacion del autor.
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama o TGI; el flujo previsto es la ejecucion de scripts Python del paquete (`release_tools/verify_release.py`, `release_tools/reproduce.py`, `release_tools/smoke_checkpoint.py`) tras instalar el entorno documentado en el README del archivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DCEA-RAG v18 | Scorer + ensamblado ordenado para RAG multi-salto | no disponible | no disponible | MIT (codigo y modelo); datos CC BY 4.0 | Repositorio HF con ZIP y checksums |
| BAAI/bge-reranker-base | Cross-encoder de reranking | no disponible en la informacion | no disponible | MIT | Modelo base upstream, disponible en HF |
| Rerankers genericos de recuperacion (p. ej. familia bge-reranker) | Cross-encoder de relevancia | no disponible | no disponible | MIT en la variante base | Disponibles en HF |

La comparacion relevante es frente a su modelo base: DCEA-RAG anade una cabecera conjunta de aristas y un procedimiento de ensamblado con presupuesto de pasajes unicos, mientras que bge-reranker-base puntua relevancia de forma independiente por par consulta-pasaje. No se dispone de datos comparativos de rendimiento entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo listo para uso directo: se distribuye como artefactos de investigacion en ZIP, sin widget de inferencia, y requiere seguir el flujo de instalacion y verificacion documentado.
- El conjunto de evaluacion final no es un test oculto oficial; los resultados no deben interpretarse como rendimiento en un benchmark publico independiente.
- El paquete no establece robustez frente a semillas de entrenamiento; no se incluyen corpora completos de transferencia ni todas las caches suplementarias (ver `REPRODUCIBILITY_SCOPE.md`).
- La comparacion de respuestas mide la intervencion completa de ensamblado ordenado, no el efecto aislado de cada componente.
- Idiomas: los datos de evaluacion son en ingles (MuSiQue-Ans v1.0); no hay evidencia de soporte multilingue.
- Licencias: el codigo y las modificaciones del modelo son MIT, pero los textos, etiquetas y ejemplos derivados de MuSiQue siguen siendo CC BY 4.0; la metadata MIT del repositorio no relicencia esos datos.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el pipeline se centra en seleccion y orden de evidencia, no en la fidelidad de la respuesta generada.
- Sesgos conocidos: no documentados.
- Para produccion, la ausencia de especificaciones de contexto, latencia y formatos de pesos estandar (safetensors, GGUF) complica la integracion en stacks convencionales de serving.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xingkongf001/DCEA-RAG
- Codigo y resultados (ZIP): https://huggingface.co/xingkongf001/DCEA-RAG/resolve/main/downloads/DCEA_RAG_v18_code_results_mit.zip?download=true
- Joint scorer (ZIP): https://huggingface.co/xingkongf001/DCEA-RAG/resolve/main/downloads/DCEA_RAG_v18_joint_model_mit.zip?download=true
- Unary-only scorer (ZIP): https://huggingface.co/xingkongf001/DCEA-RAG/resolve/main/downloads/DCEA_RAG_v18_unary_model_mit.zip?download=true
- Ejemplos de entrenamiento (ZIP, CC BY 4.0): https://huggingface.co/xingkongf001/DCEA-RAG/resolve/main/downloads/DCEA_RAG_v18_training_data_cc_by_4.zip?download=true
- Verificacion de checksums: https://huggingface.co/xingkongf001/DCEA-RAG/blob/main/DOWNLOAD_SHA256.json
- Alcance de reproducibilidad: https://huggingface.co/xingkongf001/DCEA-RAG/blob/main/REPRODUCIBILITY_SCOPE.md
- Estado de licencias: https://huggingface.co/xingkongf001/DCEA-RAG/blob/main/LICENSE_STATUS.md
- Ficha de datos: https://huggingface.co/xingkongf001/DCEA-RAG/blob/main/DATA_CARD.md
- Modelo base: https://huggingface.co/BAAI/bge-reranker-base
