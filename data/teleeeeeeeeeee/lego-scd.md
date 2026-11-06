# Teleeeeeeeeeee/LEGO-SCD

## Resumen

LEGO-SCD (Learning from Automatic 3D Gaussian Splatting Edits for Online Bayesian Scene Change Detection) es un metodo de deteccion de cambios de escena en linea desarrollado por Changrui Zhu y Simon Julier en el University College London. A diferencia de un modelo generativo conventional, este repositorio de Hugging Face no aloja pesos de una red neuronal entrenada de forma general, sino los parametros estadisticos ajustados por escena que el metodo LEGO-SCD utiliza para razonar sobre cambios en reconstrucciones 3D Gaussian Splatting (3DGS).

El problema que resuelve es la deteccion online de cambios en escenas reconstruidas con 3DGS: dado un conjunto de vistas de referencia y observaciones actuales, el sistema debe decidir que zonas de la escena han cambiado y cuales permanecen inalteradas. LEGO-SCD aprende modelos estadisticos a partir de ediciones automaticas de la referencia 3DGS y de observaciones de referencia sin cambios, y combina la evidencia de la vista actual con el historial acumulado mediante inferencia bayesiana.

Es relevante porque aborda la deteccion de cambios de forma especifica por escena y en linea, un regimen poco cubierto por los detectores de cambios 2D tradicionales. El repositorio contiene parametros ajustados para 20 instancias de escena del dataset PASLCD y cuatro escenas de CCS3D (bedroom, bookcase, desk, livingroom), con un total de aproximadamente 88 MB de ficheros sin comprimir. No se trata de un modelo de lenguaje ni de un modelo de vision general: es un artefacto de parametros para un pipeline de investigacion concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Metodo bayesiano online sobre 3D Gaussian Splatting (parametros estadisticos ajustados por escena, no una red neuronal unica) |
| Parametros totales | no disponible (el repo contiene ficheros de parametros por escena, ~88 MB sin comprimir) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | CC BY 4.0 (parametros ajustados); datasets y pesos de terceros conservan sus licencias |
| Formato de pesos | `.pt` (suppression.pt, unchanged.pt), `.json` (likelihood.json, prior.json, split.json), `.pkl` (contour.pkl); distribuidos en `pretrained.zip` |

## Arquitectura y entrenamiento

LEGO-SCD no es un transformer ni un modelo generativo, sino un pipeline de deteccion de cambios que opera sobre reconstrucciones 3D Gaussian Splatting. El metodo aprende modelos estadisticos a partir de dos fuentes: ediciones automaticas de la reconstruccion de referencia 3DGS y observaciones de referencia que permanecen sin cambios. Con esa base, combina la evidencia de la vista actual con la evidencia historica acumulada para producir una decision de cambio en linea.

Cada instancia de escena incluye seis artefactos de parametros: `suppression.pt` (supresor de respuesta ajustado), `likelihood.json` (mapeo de evidencia de imagen), `unchanged.pt` (estadisticas de respuesta sin cambios para acumulacion historica), `prior.json` (prior efectivo por pixel), `contour.pkl` (filtro de contorno ajustado para refinamiento) y `split.json` (informacion de particion de vistas de referencia). Las estadisticas de respuesta sin cambios estan indexadas por gaussiana, de modo que reemplazar, podar o reordenar una reconstruccion exige reajustar los parametros, y cada escena nueva requiere su propio ajuste offline.

El repositorio incluye un modo `--pixel-only` para ejecutar sin refinamiento de salida. La evaluacion se realiza con `run_evaluation.py` sobre PASLCD o CCS3D. Los datasets, las reconstrucciones de referencia y los pesos de SAM2/XFeat se obtienen por separado siguiendo las instrucciones del repositorio de codigo; este repo de Hugging Face contiene solo los parametros ajustados, no el entorno de inferencia completo.

## Capacidades

- Deteccion de cambios de escena en linea sobre reconstrucciones 3D Gaussian Splatting.
- Aprendizaje de modelos estadisticos a partir de ediciones automaticas de la referencia 3DGS.
- Acumulacion de evidencia historica mediante estadisticas de respuesta sin cambios indexadas por gaussiana.
- Inferencia bayesiana que combina evidencia de la vista actual con el historial acumulado.
- Refinamiento de salida mediante filtro de contorno ajustado (opcional, desactivable con `--pixel-only`).
- Soporte para dos datasets de evaluacion: PASLCD (20 instancias de escena) y CCS3D (bedroom, bookcase, desk, livingroom).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No dispone de capacidades multilingues, vision general, audio ni thinking mode.

## Casos de uso

- Deteccion de cambios en escenas reconstruidas con 3DGS para investigacion en vision por computador: el metodo permite evaluar si una escena ha cambiado comparando vistas actuales con la referencia, usando los parametros ajustados por escena incluidos en el repo.
- Reproduccion de resultados del paper: los parametros coinciden con las reconstrucciones de referencia usadas por el codigo liberado, lo que permite replicar las evaluaciones sobre PASLCD y CCS3D con `run_evaluation.py`.
- Monitorizacion de entornos domesticos en datasets de interior: las escenas de CCS3D (bedroom, bookcase, desk, livingroom) permiten validar la deteccion de cambios en habitaciones con objetos reorganizados.
- Extension a nuevas escenas mediante ajuste offline: el pipeline documenta como ajustar parametros para escenas nuevas, lo que sirve de base para adaptar el metodo a otros datasets de reconstruccion 3DGS.
- Investigacion en inferencia bayesiana aplicada a vision 3D: el desacoplamiento entre supresor de respuesta, prior por pixel y estadisticas historicas ofrece un marco modular para experimentar con acumulacion de evidencia.
- Evaluacion comparativa de detectores de cambios: al ejecutarse en modo completo o `--pixel-only`, permite aislar la contribucion del refinamiento de contorno frente a la deteccion puramente por pixel.
- Base para sistemas de mantenimiento de gemelos digitales: la deteccion online de cambios sobre reconstrucciones 3DGS es aplicable a la actualizacion de representaciones de escena en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; el metodo depende de reconstrucciones 3DGS y de los pesos de SAM2/XFeat, que se obtienen por separado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el metodo se ejecuta mediante el repositorio de codigo (`run_evaluation.py`), no mediante servidores de inferencia como vLLM, llama.cpp, Ollama o TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles; la model card indica que el repositorio de codigo documenta los tiempos online por separado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LEGO-SCD | Deteccion de cambios online sobre 3DGS | Parametros por escena (~88 MB) | no aplica | CC BY 4.0 | Hugging Face + GitHub |
| Detectores de cambios 2D clasicos | Segmentacion de diferencias en imagen | Redes especificas por metodo | no aplica | Variable | Multiples repositorios |
| Metodos de deteccion de cambios en 3DGS | Comparacion de reconstrucciones 3D | Variable | no aplica | Variable | Literatura academica |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Los parametros estan indexados por gaussiana: reemplazar, podar o reordenar una reconstruccion invalida las estadisticas de respuesta sin cambios y exige reajustar los parametros.
- Cada escena nueva requiere su propio ajuste offline; el repositorio no generaliza a escenas no incluidas en el ajuste.
- El repositorio contiene solo los parametros ajustados, no el entorno de inferencia completo: los datasets, reconstrucciones de referencia y pesos de SAM2/XFeat deben obtenerse por separado.
- La licencia CC BY 4.0 cubre los derechos de los contribuyentes del proyecto sobre los parametros ajustados; los datasets de origen, las reconstrucciones de referencia y el codigo y pesos de terceros conservan sus propias licencias (ver `LICENSE.md` y `CCS3D_LICENSE.md`).
- El modelo esta etiquetado unicamente para ingles y no dispone de capacidades linguisticas; no debe evaluarse como modelo de lenguaje.
- No se han publicado benchmarks en la informacion disponible, por lo que no es posible verificar el rendimiento de forma independiente a partir de estos datos.
- Al ser un artefacto de investigacion con 0 descargas y 0 likes, no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Riesgo de sesgo y alucinacion: no aplica en el sentido de modelos generativos, pero la calidad de la deteccion depende de la fidelidad de las reconstrucciones 3DGS y de los datos de ajuste por escena.

## Enlaces

- Hugging Face: https://huggingface.co/Teleeeeeeeeeee/LEGO-SCD
- Paper (arXiv): https://arxiv.org/abs/2610.28490
- Codigo (GitHub): https://github.com/changruizhu96/LEGO-SCD
- Pagina del proyecto: https://changruizhu96.github.io/work/lego-scd/
- Dataset PASLCD: https://huggingface.co/datasets/ChamudithaJay/PASLCD
- Dataset CCS3D: https://huggingface.co/datasets/zr-zhou/CCS3D
