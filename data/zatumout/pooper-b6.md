# zatumout/pooper-b6

## Resumen

pooper-b6 es un modelo de genómica computacional de tipo sequence-to-function desarrollado por el usuario zatumout y publicado en Hugging Face. Predice 1.885 pistas de señal ENCODE (ATAC-seq, DNase-seq, ChIP-seq de histonas y RNA-seq sobre el ensamblado GRCh38) a resolución de 1 pb a partir de una ventana de ADN de 131.072 pb. Con aproximadamente 407 millones de parámetros entrenables, emplea una arquitectura de estilo AlphaGenome con una cabeza lineal por pista, entrenada desde inicialización aleatoria, sin pesos preentrenados de AlphaGenome.

La relevancia del modelo reside en su enfoque de supervisión: en lugar de entrenar directamente contra la señal ENCODE cruda, utiliza los denominados "Zipoop teacher shards", redes docentes pequeñas sobreajustadas por cada ventana de 32.768 pb que comprimen las 1.885 pistas de esa ventana. Esto convierte al modelo en un prototipo de investigación para explorar la destilación de señal genómica multi-pista con recursos modestos: todo el entrenamiento se realizó en una única RTX 3090.

Se trata de un prototipo de investigación, no de una herramienta validada para uso clínico ni para predicción de efectos de variantes. El repositorio ocupa 1,8 GB e incluye el checkpoint, el código de reproducción y los registros de entrenamiento, pero no los shards docentes originales (120 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone de estilo AlphaGenome con cabeza lineal por pista (transformer) |
| Parámetros totales | 406.817.601 entrenables; 453M tensores en total (incluye módulos AlphaGenome congelados sin usar) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 pb de entrada (4 ventanas de 32.768 pb) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo genómico, no lingüístico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch `state_dict` (`.pt`) |
| Salida | 1.885 pistas a resolución de 1 pb |
| Función de pérdida | Pearson loss + término MSE en espacio escalado (peso 0,1) |
| Optimizador | LR pico 5e-4, 500 pasos de warm-up, decaimiento coseno hasta 10%, bf16, semilla 0 |
| Régimen de entrenamiento | 20.000 pasos, batch de 4 ventanas, gradient checkpointing |
| Hardware de entrenamiento | 1 x RTX 3090 (vast.ai) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de estilo AlphaGenome: un backbone tipo transformer que procesa una ventana de ADN de 131.072 pb (cuatro ventanas contiguas de 32.768 pb) y produce, mediante una cabeza lineal independiente por pista, predicciones a resolución de 1 pb para cada una de las 1.885 pistas ENCODE. El checkpoint incluye módulos AlphaGenome congelados que no se utilizan en el cómputo efectivo, de ahí la diferencia entre los 453M parámetros tensoriales y los 406,8M entrenables.

El entrenamiento se realizó desde inicialización aleatoria, sin pesos preentrenados de AlphaGenome. La supervisión proviene de los Zipoop teacher shards: una red docente pequeña sobreajustada por cada ventana de 32.768 pb que comprime las 1.885 pistas de esa ventana. La pérdida combina una correlación de Pearson con un término MSE en espacio escalado de peso 0,1. El régimen consta de 20.000 pasos con batch de 4 ventanas y gradient checkpointing, ejecutados en dos etapas: los pasos 0-3.000 como experimento de control "B6" y los pasos 3.000-20.000 reanudados desde ese checkpoint con el calendario coseno recalculado para 20.000 pasos totales. Se empleó la partición fold0 de AlphaGenome (63.946 ventanas de entrenamiento, 10.822 de validación, 10.345 de test) únicamente para mantener la comparabilidad de la evaluación.

## Capacidades

- Predicción de 1.885 pistas de señal ENCODE (ATAC-seq, DNase-seq, ChIP-seq de histonas y RNA-seq) sobre GRCh38 a resolución de 1 pb.
- Procesamiento de ventanas de ADN de 131.072 pb como contexto de entrada.
- Modelado multi-pista simultáneo mediante cabezas lineales por pista.
- Salida densa a resolución de base única, adecuada para análisis de accesibilidad de cromatina y patrones de unión de histonas.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión ni de audio.
- No dispone de modo de razonamiento (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Análisis de accesibilidad de cromatina: el modelo predice pistas ATAC-seq y DNase-seq con las correlaciones más altas del conjunto (Pearson 0,674 y 0,653 en validación), por lo que puede emplearse para priorizar regiones genómicas con probable accesibilidad en un contexto celular dado.
- Estudio de marcas de histonas: con un Pearson de 0,447 en ChIP de histonas, sirve para explorar patrones de modificación asociados a estados de cromatina, siempre como aproximación exploratoria y no como sustituto de datos experimentales.
- Predicción de expresión génica a partir de secuencia: la pista RNA-seq alcanza un Pearson de 0,290 a resolución de 1 pb y 0,558 tras agregación log1p a 128 pb, lo que permite análisis comparativos de señal de expresión en ventanas largas.
- Investigación en destilación de modelos genómicos: al entrenarse contra los Zipoop teacher shards, el modelo es un banco de pruebas para estudiar cómo se transfiere la información multi-pista desde redes docentes sobreajustadas a un backbone de mayor tamaño.
- Reproducción de experimentos de sequence-to-function: el repositorio incluye `repro/` con el código de entrenamiento y evaluación, los scripts de cola, el registro completo, la partición fold0 y las versiones de librerías, lo que permite reproducir el pipeline en hardware de consumo.
- Evaluación comparativa de arquitecturas: al compartir receta con el modelo hermano b8, permite contrastar variantes de la misma familia bajo idéntica partición y supervisión.
- Docencia y experimentación con modelos genómicos a escala reducida: con 407M de parámetros y entrenamiento en una sola RTX 3090, es viable como caso práctico en cursos de bioinformática computacional.

## Benchmarks y rendimiento

Validación (fold0, Pearson por ventana, paso final 20.000, según el registro de entrenamiento):

| Ensayo | Pearson | Pearson log1p 128 pb |
|---|---|---|
| ATAC | 0,674 | 0,611 |
| DNase | 0,653 | 0,635 |
| ChIP (histonas) | 0,447 | 0,452 |
| RNA-seq | 0,290 | 0,558 |
| Media / balanceada | 0,416 / 0,516 | - / 0,564 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Las métricas anteriores son cifras de validación extraídas del registro de entrenamiento; no se incluye una evaluación de test de estilo oficial sobre fold1 para b6. El modelo hermano b8 dispone de una evaluación adicional con Pearson agrupado por pista de estilo AlphaGenome sobre 400 ventanas de test, consultable en su repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa 1.814.125.434 bytes (aproximadamente 1,8 GB), lo que sugiere un requisito de VRAM moderado en precisión nativa, sin cifra confirmada.
- GPU recomendadas: no disponible; el entrenamiento se realizó en una única RTX 3090.
- Compatibilidad con GPU de consumo: el entrenamiento cupo en una RTX 3090 con gradient checkpointing, lo que indica viabilidad en GPU de consumo de gama alta para inferencia, aunque no se documenta una cifra de VRAM de inferencia.
- Opciones de despliegue: no disponible; el formato es un `state_dict` de PyTorch, por lo que requiere cargar el modelo con el código de `repro/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pooper-b6 | 406,8M entrenables | 131.072 pb | Sequence-to-function, 1.885 pistas ENCODE | CC-BY-4.0 | Hugging Face |
| pooper-b8 (hermano) | No disponible | No disponible | Misma receta, evaluación adicional en test | No disponible | Hugging Face |
| AlphaGenome | No disponible | No disponible | Sequence-to-function multi-pista | No disponible | No disponible |

No se dispone de datos suficientes en la información proporcionada para comparar parámetros, contexto, rendimiento y disponibilidad de AlphaGenome u otras alternativas de la misma categoría. La única comparación documentada es con el modelo hermano b8, que comparte receta y añade una evaluación con Pearson agrupado por pista sobre 400 ventanas de test.

## Limitaciones y advertencias

- Las métricas presentadas son números de validación procedentes del registro de entrenamiento; no se incluye una evaluación de test de estilo oficial sobre fold1 para b6.
- RNA-seq y ChIP de histonas son claramente más débiles que ATAC y DNase (Pearson 0,290 y 0,447 frente a 0,674 y 0,653).
- Es un prototipo de investigación, no una herramienta validada para uso clínico ni para predicción de efectos de variantes.
- El modelo se entrenó contra los Zipoop teacher shards; la model card no afirma que las puntuaciones reflejen concordancia con la señal ENCODE cruda.
- Los resultados provienen de una única semilla (semilla 0), sin estudio de variabilidad.
- Los shards docentes originales (120 GB) no se incluyen en el repositorio, lo que limita la reproducción completa del pipeline de supervisión.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero la ausencia de validación clínica desaconseja cualquier aplicación en entornos regulados.
- No se documentan sesgos específicos ni riesgos de alucinación en el sentido lingüístico; al ser un modelo genómico, el riesgo equivalente es la sobreconfianza en predicciones de señal en regiones poco representadas en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zatumout/pooper-b6
- Repositorio del modelo hermano b8: https://huggingface.co/zatumout/pooper-b8 (referenciado en la model card; no verificado en la información disponible)
- Código de reproducción: incluido en `repro/code.tgz` dentro del repositorio del modelo
- Instrucciones de reproducción: `repro/README_复现.md` (en chino) dentro del repositorio del modelo
