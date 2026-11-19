# virtual-human-chc/hyformer_peptides_34M_MIC

## Resumen

Hyformer es una familia de modelos transformer desarrollada por el grupo de Ewa Szczurek (Szczurek Lab, Universidad de Varsovia) que unifica en una sola arquitectura un decodificador generativo de moleculas y un codificador predictivo de propiedades. La variante `hyformer_peptides_34M_MIC` parte del checkpoint de peptidos de 34M de parametros y se ha ajustado conjuntamente para predecir la concentracion inhibitoria minima (MIC) frente a la bacteria *E. coli*, manteniendo a la vez la capacidad de generar peptidos nuevos.

El modelo resuelve el problema clasico de separar generacion molecular y prediccion de propiedades en dos modelos independientes: Hyformer usa una mascara causal cuando actua como generador (probabilidades de token) y una mascara bidireccional cuando actua como predictor (valor de propiedad), compartiendo los mismos pesos. Esto permite optimizacion conjunta y, segun el articulo asociado (arXiv:2504.16559), beneficios sinergicos entre ambas tareas.

Es relevante para investigadores en descubrimiento de farmacos antimicrobianos que necesitan generar candidatos peptidicos y estimar su actividad biologica con un unico modelo. El checkpoint esta publicado con acceso restringido (gated) bajo licencia BSD 3-Clause y un repositorio de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder-decoder unificado con mascara causal o bidireccional segun tarea) |
| Parametros totales | 34M (segun nombre del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias moleculares, no de lenguaje natural) |
| Licencia | BSD 3-Clause |
| Formato de pesos | no disponible |
| Modalidad | Peptidos (secuencias) |
| Acceso | Restringido (gated), requiere formulario en Hugging Face |
| Datasets de entrenamiento | GuacaMol, ZINC, MoleculeNet; 3,5M peptidos generales y antimicrobianos (checkpoint base) |
| Desarrollador | Izdebski et al. (Szczurek Lab) |

## Arquitectura y entrenamiento

Hyformer es un transformer unico que alterna dos regimenes mediante el tipo de mascara de atencion: con mascara causal se comporta como decodificador autorregresivo que emite probabilidades sobre tokens de secuencia molecular; con mascara bidireccional se comporta como codificador que produce una prediccion escalar de propiedad. El checkpoint `hyformer_peptides_34M_MIC` deriva de `Hyformer_peptides_34M`, entrenado sobre 3,5M de peptidos de proposito general y antimicrobianos, y se ha ajustado de forma conjunta sobre valores de MIC frente a *E. coli*.

El articulo de referencia describe el entrenamiento conjunto de generacion y prediccion como una estrategia que mejora ambas tareas respecto a modelos separados. No se dispone en la informacion proporcionada de detalles sobre numero exacto de tokens de entrenamiento, composicion del dataset de ajuste, uso de RLHF/DPO ni innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de secuencias de peptidos mediante decodificacion autorregresiva (mascara causal).
- Prediccion de propiedades moleculares, en este checkpoint la MIC frente a *E. coli* (mascara bidireccional).
- Modelado conjunto de generacion y prediccion en una sola red, lo que permite optimizacion guiada por propiedad.
- Trabajo con representaciones de moleculas y peptidos (no es un modelo de lenguaje natural).
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no aplicables; el dominio es quimica y secuencias peptidicas.

## Casos de uso

- Descubrimiento de peptidos antimicrobianos: generar candidatos peptidicos con el decodificador y filtrarlos por MIC predicha frente a *E. coli*, reduciendo el numero de sintesis experimentales necesarias.
- Optimizacion guiada por propiedad: usar la cabeza predictiva como funcion objetivo durante la generacion para sesgar las secuencias hacia mayor actividad antimicrobiana.
- Priorizacion de bibliotecas peptidicas: puntuar con el encoder un conjunto existente de peptidos y ordenarlos por actividad predicha antes de ensayos in vitro.
- Estudio de sinergia generacion-prediccion: reproducir y extender los experimentos del articulo comparando el ajuste conjunto frente a modelos separados.
- Filtrado en pipelines de diseno molecular: integrar el modelo como etapa de scoring en flujos de generacion mas amplios (por ejemplo, combinado con otros generadores de moleculas).
- Investigacion academica en representacion de peptidos: usar el checkpoint base de 34M como punto de partida para ajuste fino en otras cepas bacterianas o propiedades relacionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 34M de parametros, el modelo cabe holgadamente en GPUs de consumo; en FP32 ocuparia del orden de 0,14 GB de pesos, y menos con cuantizacion (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: no disponible; el autor no documenta integracion con vLLM, llama.cpp, Ollama o TGI. El repositorio de GitHub del proyecto es la referencia para el codigo de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hyformer_peptides_34M_MIC | 34M | no disponible | Generacion + prediccion de peptidos (MIC *E. coli*) | BSD 3-Clause | Gated en Hugging Face |
| Hyformer_peptides_34M | 34M | no disponible | Generacion + prediccion de peptidos (general) | BSD 3-Clause | Hugging Face (SzczurekLab) |
| Hyformer_molecules_50M | 50M | no disponible | Generacion + prediccion de moleculas pequenas | BSD 3-Clause | Hugging Face (SzczurekLab) |
| Hyformer_molecules_8M | 8M | no disponible | Generacion + prediccion de moleculas pequenas | BSD 3-Clause | Hugging Face (SzczurekLab) |

No se dispone de datos de rendimiento comparativo con otros modelos de diseno molecular en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: requiere aprobacion mediante formulario gated en Hugging Face, lo que puede retrasar su uso en produccion.
- Dominio muy especifico: el ajuste MIC se limita a *E. coli*; la prediccion frente a otras cepas o patogenos no esta validada.
- Riesgo de sesgo hacia la distribucion de entrenamiento (3,5M de peptidos y datasets publicos), lo que puede infrarepresentar clases quimicas poco frecuentes.
- Riesgo de falsos positivos en la prediccion de actividad: las predicciones deben validarse experimentalmente antes de cualquier uso biologico.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural ni tool calling; su interfaz es sobre secuencias moleculares.
- Licencia BSD 3-Clause permite uso comercial, pero el acceso gated y la clausula de uso no malicioso del formulario anaden condiciones practicas.
- No se documentan longitudes maximas de secuencia soportadas, lo que limita la planificacion de inferencia con peptidos largos.
- Ausencia de benchmarks publicados en la informacion disponible impide comparar su rendimiento con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/virtual-human-chc/hyformer_peptides_34M_MIC
- Checkpoint base: https://huggingface.co/SzczurekLab/hyformer_peptides_34M
- Checkpoint de moleculas 8M: https://huggingface.co/SzczurekLab/hyformer_molecules_8M
- Checkpoint de moleculas 50M: https://huggingface.co/SzczurekLab/hyformer_molecules_50M
- Repositorio GitHub: https://github.com/szczurek-lab/hyformer
- Articulo: https://arxiv.org/abs/2504.16559
- Referencia GuacaMol: https://jcheminf.biomedcentral.com/articles/10.1186/s13321-019-0351-9
- Referencia Uni-Mol: https://openreview.net/forum?id=1pPpKc9wR0Y
