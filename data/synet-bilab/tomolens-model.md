# SynET-Bilab/tomolens-model

## Resumen

TomoLens es un conjunto de modelos de segmentación y preprocesamiento de imágenes de tomografía crioelectrónica (cryo-ET) mantenido por SynET-Bilab. No se trata de un modelo de lenguaje, sino de un paquete de pesos especializados en el análisis de volúmenes celulares reconstruidos mediante FIB-SEM y cryo-ET, orientado a la detección de sinapsis y a la segmentación de células intactas. El repositorio `SynET-Bilab/tomolens-model` agrupa varios bundles independientes con arquitecturas y runtimes propios.

La familia principal es «multihead», con variantes para escenas de sinapsis en preparaciones de célula intacta y FIB. Se complementa con modelos de preprocesamiento (IsoNet1 en formato ONNX e IsoNet2 como checkpoint PyTorch) y con un modelo derivado de nnInteractive para la selección de regiones de interés (RoI) mediante indicaciones puntuales y cajas delimitadoras 2D. Cada bundle incluye su propia descripción, definición de etiquetas, configuración de inferencia y sumas de comprobación.

El modelo es relevante para investigadores en biología estructural y neurociencia que trabajan con volúmenes de microscopía electrónica de gran tamaño. Su utilidad práctica reside en automatizar tareas de segmentación que de otro modo requerirían anotación manual densa. La licencia es no comercial (CC BY-NC 4.0 y CC BY-NC-SA 4.0 según el bundle), y no se ofrece un pipeline genérico de Transformers alojado: requiere el runtime documentado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | multihead (segmentación); U-Net large en IsoNet2; red derivada de nnInteractive para el modelo RoI; no disponible para el resto de bundles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | tomolens-per-model-licenses: CC BY-NC 4.0 para multihead e IsoNet; CC BY-NC-SA 4.0 para el modelo RoI derivado de nnInteractive |
| Formato de pesos | ONNX (IsoNet1); checkpoint PyTorch (IsoNet2); no disponible para multihead y RoI |

## Arquitectura y entrenamiento

El repositorio no documenta en la información disponible la arquitectura interna de los bundles multihead ni el volumen o composición de los datos de entrenamiento. Lo que sí se explicita es la organización por familias: los modelos multihead abordan escenas de sinapsis con dos preparaciones distintas (célula intacta y FIB), el modelo RoI deriva de nnInteractive y acepta indicaciones interactivas (puntos y cajas 2D) para seleccionar instancias, e IsoNet2 emplea una U-Net de tipo large con configuración `isonet2-n2n` y tamaño de cubo 128.

El preprocesamiento está separado por resolución: IsoNet1 (ONNX) se recomienda tras deconvolución cuando el tamaño de píxel supera los 15 Å/voxel o el grosor de la sección supera los 200 nm, mientras que IsoNet2 está ajustado a un tamaño de píxel de 12,18 Å/voxel. No se han publicado detalles sobre técnicas de aumento de datos, función de pérdida o etapas de ajuste fino en la información proporcionada.

## Capacidades

- Segmentación de sinapsis en volúmenes de cryo-ET para preparaciones de célula intacta y FIB.
- Segmentación de células intactas dentro de volúmenes reconstruidos.
- Preprocesamiento de tomogramas: deconvolución seguida de IsoNet1 para resoluciones bajas (píxel > 15 Å/voxel o grosor > 200 nm).
- Restauración con IsoNet2 (`isonet2-n2n`, U-Net large, cubo de 128) para datos a 12,18 Å/voxel.
- Selección interactiva de regiones de interés e instancias mediante puntos y cajas delimitadoras 2D (modelo RoI).
- Definición de etiquetas por bundle, con configuración de inferencia y checksums incluidos en cada paquete.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Detección automática de sinapsis en tomogramas de célula intacta: el bundle `multihead/synapse_intact_cell` se aplica sobre volúmenes preprocesados con IsoNet1 para generar máscaras de sinapsis sin anotación manual densa.
- Análisis de muestras preparadas por FIB: el bundle `multihead/synapse_fib` cubre la escena de sinapsis en preparaciones FIB, aunque su pipeline de preparación aún no está documentado en la información disponible.
- Segmentación de células completas: el bundle de célula intacta permite delimitar células dentro de volúmenes de cryo-ET, útil para cuantificar volúmenes y contactos celulares.
- Preprocesamiento de tomogramas de baja resolución: IsoNet1 en ONNX se integra tras la deconvolución cuando el píxel supera 15 Å/voxel o el grosor de sección supera 200 nm, mejorando la relación señal-ruido antes de la segmentación.
- Restauración de datos a resolución estándar: IsoNet2 se aplica a volúmenes de 12,18 Å/voxel con cubos de 128 para acondicionar los datos antes de pasarlos a los modelos de segmentación.
- Anotación asistida e interactiva: el modelo RoI derivado de nnInteractive permite seleccionar instancias concretas con clics y cajas 2D, acelerando la corrección manual de segmentaciones en flujos de anotación.
- Integración en pipelines de análisis batch: al distribuirse como bundles con checksums y configuración de inferencia, los modelos pueden encadenarse en scripts de procesamiento por lotes sobre grandes colecciones de tomogramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. El repositorio no especifica modelos de GPU ni requisitos mínimos.
- Compatibilidad con GPU de consumo: no disponible; depende del runtime documentado en cada bundle, que no se detalla.
- Opciones de despliegue: los bundles requieren su runtime documentado; no se ofrece un pipeline genérico de Transformers alojado. IsoNet1 se distribuye en ONNX y puede ejecutarse con runtimes ONNX; IsoNet2 se distribuye como checkpoint PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.
- Tamaño del repositorio: 1,2 GB, lo que da una cota superior del espacio en disco necesario para los pesos agregados.

## Comparativa con modelos similares

| Modelo | Familia | Tarea | Formato | Licencia | Contexto / resolución | Disponibilidad |
|---|---|---|---|---|---|---|
| TomoLens multihead (Synapse / Intact Cell) | multihead | Segmentación de sinapsis y célula intacta | no disponible | CC BY-NC 4.0 | preprocesado con IsoNet1 | Hugging Face (SynET-Bilab) |
| TomoLens multihead (Synapse / FIB) | multihead | Segmentación de sinapsis en FIB | no disponible | CC BY-NC 4.0 | preparación no documentada | Hugging Face (SynET-Bilab) |
| TomoLens IsoNet1 | preprocesamiento | Deconvolución y restauración | ONNX | CC BY-NC 4.0 | píxel > 15 Å/voxel o grosor > 200 nm | Hugging Face (SynET-Bilab) |
| TomoLens IsoNet2 | preprocesamiento | Restauración n2n | PyTorch checkpoint | CC BY-NC 4.0 | 12,18 Å/voxel, cubo 128 | Hugging Face (SynET-Bilab) |
| TomoLens RoI (nnInteractive) | interactivo | Selección de instancias | no disponible | CC BY-NC-SA 4.0 | 68,57 Å/voxel | Hugging Face (SynET-Bilab) |

No se dispone de datos de benchmarks ni de modelos externos comparables en la información proporcionada; la comparativa se limita a los propios bundles del repositorio.

## Limitaciones y advertencias

- Licencia no comercial: los bundles multihead e IsoNet usan CC BY-NC 4.0 y el modelo RoI usa CC BY-NC-SA 4.0 con condición de ShareAlike, lo que restringe el uso comercial y obliga a compartir derivados bajo la misma licencia en el caso del RoI.
- Requiere el runtime documentado por el autor; no existe un pipeline genérico de Transformers alojado, lo que complica la integración en infraestructuras estándar de inferencia.
- El bundle `synapse_fib` no tiene documentado su pipeline de preparación, lo que limita su reproducibilidad.
- Los modelos están ajustados a resoluciones concretas (IsoNet1 para píxel > 15 Å/voxel o grosor > 200 nm; IsoNet2 a 12,18 Å/voxel; RoI a 68,57 Å/voxel); aplicarlos fuera de ese rango puede degradar los resultados.
- No se documentan sesgos, tasas de alucinación ni límites de generalización entre distintos microscopios o protocolos de adquisición.
- No hay información sobre parámetros totales, cuantizaciones soportadas ni requisitos de hardware, lo que dificulta planificar el despliegue.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación por parte de la comunidad es aún muy limitada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SynET-Bilab/tomolens-model
- Bundle multihead Synapse / Intact Cell: https://huggingface.co/SynET-Bilab/tomolens-model/blob/main/multihead/synapse_intact_cell/README.md
- Bundle multihead Synapse / FIB: https://huggingface.co/SynET-Bilab/tomolens-model/blob/main/multihead/synapse_fib/README.md
- Modelo de preprocesamiento IsoNet1: https://huggingface.co/SynET-Bilab/tomolens-model/blob/main/preprocess/isonet1/README.md
- Modelo de preprocesamiento IsoNet2: https://huggingface.co/SynET-Bilab/tomolens-model/blob/main/preprocess/isonet2/README.md
- Modelo RoI (nnInteractive): https://huggingface.co/SynET-Bilab/tomolens-model/blob/main/nninteractive/roi/README.md
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Licencia CC BY-NC-SA 4.0: https://creativecommons.org/licenses/by-nc-sa/4.0/
