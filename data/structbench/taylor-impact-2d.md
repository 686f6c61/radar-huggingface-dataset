# StructBench/taylor-impact-2d

## Resumen

StructBench/taylor-impact-2d es un checkpoint de referencia del benchmark StructBench, publicado por el autor del proyecto (qilinli) bajo la version de codigo v0.4.0. No se trata de un modelo de lenguaje: es un modelo sustituto (surrogate model) de simulacion de ingenieria estructural, entrenado para predecir el comportamiento de un caso de impacto bidimensional (`taylor_impact_2d`) sin ejecutar el simulador fisico completo. El objetivo es acelerar la evaluacion de configuraciones estructurales sustituyendo el solver numerico por una red neuronal entrenada sobre datos simulados.

El repositorio contiene un unico checkpoint registrado (`model-best-096000.pt`, 96.000 pasos de entrenamiento) de la familia CGN con esquema autorregresivo, junto con el `config.json` resuelto, las estadisticas de normalizacion, los ficheros `metrics-<split>.json` de los splits evaluados y un `SHA256SUMS` para verificar la integridad de los artefactos. La unica metrica publicada en la model card es el error relativo L2 de desplazamiento en rollout sobre el split `test_interp`: 0,1299.

Es relevante para investigadores en ingenieria estructural y en aprendizaje automatico cientifico (scientific ML) que necesiten reproducir resultados de referencia de StructBench o comparar arquitecturas sustitutas bajo una misma definicion de benchmark. No es un modelo de proposito general: su uso esta acotado al pipeline de evaluacion de StructBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CGN (familia de modelo sustituto de StructBench), esquema autorregresivo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia `cgn`, con esquema de prediccion autorregresivo, segun la tabla de la model card. El entrenamiento se ejecuto con el commit `7be9d4b` del repositorio StructBench y el checkpoint publicado corresponde al paso 96.000 (`model-best-096000.pt`). El modelo opera sobre el caso de benchmark `taylor_impact_2d`, que simula un problema de impacto en dos dimensiones; la evaluacion se realiza en modo `rollout`, es decir, propagando las predicciones de forma iterativa en el tiempo en lugar de predecir un unico paso.

El repositorio incluye el `config.json` resuelto que permite reconstruir el simulador de referencia y las estadisticas de normalizacion empleadas por el modelo, lo que garantiza la reproducibilidad de la evaluacion. No se especifican en la informacion disponible el numero de tokens ni la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de ajuste fino adicionales (RLHF, DPO u otras), dado que no son aplicables a este tipo de modelo.

## Capacidades

- Prediccion sustituta del campo de desplazamiento en simulaciones de impacto bidimensional del caso `taylor_impact_2d`.
- Evaluacion en modo `rollout` autorregresivo sobre multiples pasos temporales.
- Integracion con la CLI de StructBench (`structbench-train --mode rollout`) para reevaluar el checkpoint contra los casos canonicos.
- Verificacion de integridad de artefactos mediante `SHA256SUMS`.
- Reproduccion de los resultados de referencia del benchmark bajo la version v0.4.0 (ADR-0074, clausula 8).
- No dispone de soporte de tool calling, agentes, capacidades multilingues ni modalidades de texto, vision o audio.

## Casos de uso

- Reproduccion de resultados de referencia: descargar el bundle con `hf download` en la revision `v0.4.0` y ejecutar la CLI de StructBench para regenerar las metricas de los splits evaluados y compararlas con las publicadas.
- Comparacion de arquitecturas sustitutas: usar este checkpoint CGN como linea base frente a otras familias implementadas en StructBench, manteniendo fijas las definiciones de caso, splits y metrica.
- Validacion de pipelines de evaluacion: servir como artefacto de control para comprobar que una instalacion de StructBench reconstruye correctamente el simulador desde `config.json` y produce metricas coherentes.
- Desarrollo de metodos de surrogate modeling: emplear el error relativo L2 de rollout (0,1299 en `test_interp`) como umbral de referencia al proponer nuevas arquitecturas o funciones de perdida.
- Auditoria de integridad de artefactos: verificar los ficheros del bundle contra `SHA256SUMS` antes de incorporarlos a un registro de resultados o a un pipeline de CI.
- Docencia e investigacion en ingenieria estructural computacional: ilustrar el flujo completo de benchmark (checkpoint, configuracion, normalizacion, metricas) en un caso de impacto 2D acotado y reproducible.

## Benchmarks y rendimiento

| Split | Metrica | Valor |
|---|---|---|
| test_interp | rollout_rel_l2_disp | 0,1299 |

No se han publicado en la informacion disponible resultados adicionales de benchmarks ni comparaciones numericas con otras familias del mismo benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamano del repositorio es de 0,0 GB y no se detallan parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la evaluacion se realiza mediante la CLI de StructBench (`structbench-train`), que reconstruye el simulador desde el `config.json` del bundle; no se documentan servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada solo incluye la fila CGN de la tabla de checkpoints; no se detallan otras familias, tamanos ni resultados comparables dentro de StructBench.

## Limitaciones y advertencias

- El modelo esta acotado exclusivamente al caso `taylor_impact_2d`; no es transferible a otros casos de simulacion sin reentrenamiento.
- Solo se publica una metrica (rollout_rel_l2_disp en `test_interp`); no hay datos de generalizacion a otras distribuciones ni de robustez fuera de los splits evaluados.
- El error relativo L2 de 0,1299 implica una desviacion no despreciable en la prediccion del desplazamiento; debe evaluarse si es aceptable para el uso previsto antes de sustituir al simulador.
- La evaluacion sobrescribe el fichero `metrics-<split>.json` descargado; es necesario conservar una copia para comparar con los valores publicados.
- No se especifican sesgos, limitaciones idiomaticas ni restricciones de contexto por no ser aplicables a un modelo de simulacion.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero el uso esta condicionado a la correcta reconstruccion del entorno de evaluacion (version v0.4.0 y `config.json` original).
- No se documentan limitaciones de produccion adicionales en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StructBench/taylor-impact-2d
- Repositorio de codigo y definiciones del benchmark: https://github.com/qilinli/StructBench
- Registro de resultados del benchmark: https://github.com/qilinli/StructBench/blob/v0.4.0/docs/benchmarks/taylor_impact_2d.md
