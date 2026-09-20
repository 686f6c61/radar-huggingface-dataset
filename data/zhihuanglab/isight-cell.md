# zhihuanglab/iSight-cell

## Resumen

iSight-cell es el modelo de nivel celular del sistema iSight, desarrollado por el laboratorio de Zhi Huang (zhihuanglab, Penn Medicine). Está diseñado para el análisis cuantitativo de tinciones de inmunohistoquímica (IHC) en imágenes de patología: cada célula de la imagen es segmentada, iSight-target selecciona las células de interés para el tejido y iSight-cell puntúa cada célula seleccionada en dos tareas de clasificación, intensidad de tinción (negativa / débil / moderada / fuerte) y localización subcelular (ninguna / nuclear / citoplasmático-membranosa / ambas).

A partir de las puntuaciones celulares, el sistema construye resultados a nivel de imagen: recuento de células, mapa espacial y fracción teñida medida. Esto lo sitúa en el ámbito de la patología computacional de precisión, donde la cuantificación objetiva y reproducible de biomarcadores reemplaza o complementa la lectura visual del patólogo.

El modelo emplea un backbone UNI2-h (ViT-g/14) afinado por completo, con dos cabezas de clasificación. Se distribuye como un checkpoint de PyTorch con licencia académica de Penn, restringida a uso no comercial. Es relevante ahora porque ofrece una aproximación agnóstica al marcador y a nivel de célula, en un momento en que los modelos fundacionales de patología están entrando en flujos de investigación traslacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer UNI2-h (ViT-g/14) afinado por completo, con dos cabezas de clasificación |
| Parametros totales | No disponible en la model card (backbone ViT-g/14; esta familia de arquitecturas se sitúa en el rango de 1.000-1.300 millones de parámetros) |
| Longitud de contexto | No aplica: modelo de visión con entrada fija de recorte RGB de 64x64 px reescalado a 224x224 |
| Tipos de cuantizacion | No disponible (los pesos se publican como state dict en punto flotante) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | PENN Academic Software License Agreement (penn-academic-software-license), solo uso en investigación no comercial |
| Formato de pesos | PyTorch state dict (`checkpoints/iSight-cell.pt`) más `config.json` |

## Arquitectura y entrenamiento

La arquitectura parte de UNI2-h, un vision transformer de tipo ViT-g/14 (parche de 14x14, escala giant) preentrenado como modelo fundacional de patología a partir de la librería UNI2. Sobre ese backbone, iSight-cell aplica un ajuste fino completo y añade dos cabezas de clasificación: una para la intensidad de tinción, con cuatro clases (negativa, débil, moderada, fuerte), y otra para la localización subcelular, también con cuatro clases (ninguna, nuclear, citoplasmático-membranosa, ambas).

La entrada es un recorte RGB de 64x64 píxeles centrado en la célula, reescalado a 224x224 y normalizado con estadísticas de ImageNet. Este diseño desacopla la puntuación celular de la segmentación y de la selección de células, que se delegan en el componente iSight-target, del que iSight-cell depende explícitamente.

El modelo se entrenó sobre el dataset HPA10M (nirschl-lab/hpa10m). No se especifican en la información disponible el número de épocas, el volumen exacto de recortes usados, la composición detallada del dataset, ni si hubo etapas de ajuste con preferencias humanas; dado que es un clasificador de visión y no un modelo generativo, no se aplican técnicas de RLHF o DPO.

## Capacidades

- Clasificación de intensidad de tinción IHC por célula en cuatro niveles: negativa, débil, moderada y fuerte.
- Clasificación de localización subcelular de la tinción en cuatro categorías: ninguna, nuclear, citoplasmático-membranosa y ambas.
- Puntuación célula a célula sobre recortes de 64x64 píxeles centrados en la célula.
- Agregación implícita a métricas de nivel de imagen cuando se combina con iSight-target y el pipeline iSight: recuento de células teñidas, mapa espacial y fracción teñida medida.
- Funcionamiento agnóstico al marcador dentro de los patrones de tinción aprendidos (nuclear, citoplasmático-membranoso o ambos).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente ni soporte multilingüe: es un clasificador de visión especializado.

## Casos de uso

- Cuantificación de biomarcadores nucleares en investigación oncológica: el modelo puntúa la intensidad y la localización de la tinción de marcadores como ER, PR o Ki-67 en cada célula, permitiendo calcular índices de positividad reproducibles sobre cohortes completas.
- Evaluación de marcadores de membrana como HER2: la clasificación de localización citoplasmático-membranosa frente a nuclear ayuda a separar patrones de tinción completos, incompletos o ausentes a nivel celular, un requisito habitual en la categorización de muestras de mama y gástricas.
- Análisis espacial del microambiente tumoral: al producir puntuaciones por célula junto con su posición, el modelo permite construir mapas de densidad de células teñidas y estudiar la distribución espacial de la positividad dentro del tejido.
- Control de calidad de tinción en laboratorio: la distribución de clases de intensidad por portaobjetos sirve como señal objetiva de tinción excesiva, insuficiente o heterogénea, útil para detectar lotes problemáticos antes de la lectura.
- Investigación traslacional y estudios de asociación: la fracción teñida medida por el modelo puede usarse como variable cuantitativa continua en análisis de supervivencia o de correlación con datos clínicos.
- Reproducción y auditoría de puntuaciones de patólogo: el desglose célula a célula permite revisar discrepancias entre la lectura humana y la automática, identificando regiones o tipos celulares donde el acuerdo es bajo.
- Preprocesado para pipelines de patología digital: las puntuaciones celulares pueden alimentar modelos de nivel de imagen, como iSight-slide, que construyen la predicción final a partir de la información celular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de iSight-cell no incluye métricas cuantitativas (exactitud, F1, AUC, coeficiente kappa ni comparaciones con patólogos o con otros modelos) sobre el dataset de entrenamiento o sobre conjuntos de validación externos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,5 GB, coherente con pesos en precisión completa para un backbone de escala ViT-g/14. Se estima un consumo de aproximadamente 5-6 GB en fp32 y alrededor de 3 GB en fp16 o bf16, sin contar los requisitos del pipeline de segmentación y de iSight-target.
- GPU recomendadas: cualquier GPU con 8 GB o más de memoria, como una RTX 3060 de 12 GB, RTX 4070, RTX 4090, o aceleradores de centro de datos tipo A100, H100, L40S o T4 para despliegues por lotes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GPU de consumo modernas con 8-12 GB de VRAM, siempre que el pipeline completo (segmentación, iSight-target e iSight-cell) se ejecute de forma secuencial o por lotes pequeños.
- Opciones de despliegue: carga directa en PyTorch mediante `huggingface_hub.hf_hub_download` y `torch.load`; el repositorio de código `isight_cell/` del proyecto iSight. No es compatible con vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El coste real depende del número de células por imagen, que puede ser de miles por portaobjetos, por lo que conviene procesar por lotes en GPU y paralelizar por regiones.

## Comparativa con modelos similares

| Modelo | Nivel de analisis | Backbone | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhihuanglab/iSight-cell | Celular | UNI2-h (ViT-g/14) | Intensidad de tinción y localización subcelular | Penn Academic, solo no comercial | HuggingFace, requiere iSight-target |
| zhihuanglab/iSight-slide | Imagen completa | No disponible en la información proporcionada | Resultado agregado a nivel de imagen | Penn Academic, solo no comercial | HuggingFace |
| UNI2-h (modelo fundacional de patología) | Parche de imagen | ViT-g/14 | Embeddings de propósito general | No disponible en la información proporcionada | Público, como backbone de terceros |

No se dispone de información sobre otros modelos comparables de puntuación celular de IHC con los que establecer una comparación de rendimiento directa. Los resultados de la búsqueda web realizada no contienen referencias relevantes al modelo.

## Limitaciones y advertencias

- Licencia restrictiva: la Penn Academic Software License Agreement limita el uso a investigación no comercial. Cualquier uso clínico, diagnóstico o comercial requiere autorización expresa del titular.
- Dependencia externa: iSight-cell requiere obligatoriamente zhihuanglab/iSight-target para la selección de células de interés. Sin ese componente, el modelo no puede operar de forma autónoma.
- Ámbito restringido: el modelo solo clasifica intensidad de tinción y localización subcelular en imágenes IHC. No genera texto, no razona, no ejecuta código y no procesa lenguaje natural.
- Sesgos potenciales: al entrenarse sobre el dataset HPA10M, el comportamiento puede degradarse en tejidos, marcadores, anticuerpos, escáneres o protocolos de tinción poco representados en ese conjunto. No se documentan análisis de sesgo por lote, centro o población.
- Riesgo de error en la clasificación: los errores en la puntuación celular se propagan de forma acumulativa a las métricas de nivel de imagen (recuento, fracción teñida), por lo que la validación local frente a lectura de patólogo es imprescindible antes de cualquier uso en investigación cuantitativa.
- Ausencia de métricas publicadas: no hay benchmarks, intervalos de confianza ni estudios de concordancia en la información disponible, lo que dificulta estimar el rendimiento esperado.
- Sin cobertura multilingüe ni de contexto largo: no aplica ningún parámetro de idioma ni ventana de contexto textual; la entrada es una imagen fija.
- Ausencia de soporte y adopción: el modelo registra 0 descargas y 0 interacciones en HuggingFace, sin pipeline declarado, lo que implica poca validación por parte de la comunidad.
- Fechas de publicación inusuales: los metadatos indican creación y actualización en septiembre de 2026, dato que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhihuanglab/iSight-cell
- Modelo de nivel de imagen iSight-slide: https://huggingface.co/zhihuanglab/iSight-slide
- Modelo de selección de células iSight-target: https://huggingface.co/zhihuanglab/iSight-target
- Repositorio de código iSight (directorio `isight_cell/`): https://github.com/zhihuanglab/iSight
- Dataset de entrenamiento HPA10M: https://huggingface.co/datasets/nirschl-lab/hpa10m
- Licencia PENN Academic Software License Agreement: https://huggingface.co/zhihuanglab/iSight-cell/blob/main/LICENSE
- Contacto: zhi.huang@pennmedicine.upenn.edu
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a servicios de genealogía y no guardan relación con iSight-cell.
