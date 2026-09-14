# ZZRI/Feihua-n1-64M

## Resumen

Feihua-n1-64M es un modelo de lenguaje en chino de 63.912.192 parámetros (63,91 M) publicado por ZZRI, derivado del modelo base jingyaogong/minimind-3 y entrenado con el pipeline de este último. Su objetivo declarado no es responder de forma útil, sino exactamente lo contrario: generar respuestas gramaticalmente correctas, de tono formal y con cero información aprovechable, dentro del género chino conocido como 废话文学 ("literatura de relleno" o "de lo obvio"). Es, por tanto, un modelo conversacional especializado en tautologías, razonamiento circular y condicionales sin consecuente.

En lo técnico se trata de un transformer decoder-only con la arquitectura Qwen3 (8 capas) en formato Transformers, con versiones GGUF cuantizadas y calibradas mediante imatrix. El proceso completo combina destilación de datos, un fine-tuning supervisado de tres épocas y 200 pasos de GRPO con pérdida CISPO, ejecutados en una estación de trabajo con una Tesla P100 y una GTX 1080. El autor estima el coste total en el equivalente eléctrico de dos tés con leche y un solo día de trabajo.

Su relevancia es metodológica y docente más que práctica: documenta de extremo a extremo el ciclo destilación, SFT, RLAIF, cuantización y poda sobre hardware de 2016, y describe dos fenómenos muy habituales en producción, el reward hacking y el daño desproporcionado de la poda agresiva en modelos pequeños. Se publica bajo licencia Apache-2.0 y el repositorio ocupa 0,3 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con arquitectura Qwen3 (formato Transformers); 8 capas |
| Parámetros totales | 63.912.192 (63,91 M) |
| Longitud de contexto | No declarada en la model card; el ejemplo oficial de `llama-server` usa `-c 8192` |
| Tipos de cuantización | f16, Q8_0, Q4_K_M, IQ4_XS, IQ2_M, IQ1_S (GGUF con calibración imatrix) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF (llama.cpp) |
| Modelo base | jingyaogong/minimind-3 (Apache-2.0) |
| Tamaño del repositorio | 0,3 GB |
| Tipo de modelo | Conversacional (texto a texto), especializado en generación sin información |
| Variante derivada | Feihua-n1-64M-prune: 49 M, 6 capas, archivos desde 17 MB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 8 capas con la topología Qwen3, obtenida al convertir el producto de entrenamiento al formato Transformers mediante el pipeline oficial de minimind y después a GGUF con llama.cpp. El punto de partida es el checkpoint `full_sft` de minimind-3 (64 M, sintaxis ya consolidada), sobre el que se aplica un fine-tuning completo de 3 épocas con `lr=1e-4`, que en la Tesla P100 tardó 5 minutos. No se documenta atención lineal, decodificación especulativa ni mecanismos híbridos SSM.

El corpus de SFT tiene dos componentes: 2.500 preguntas cotidianas muestreadas del pool `sft_t2t_mini` de minimind, respondidas por un Qwen3.6-35B desplegado en local que interpreta el papel de "maestro de literatura de relleno" (unas 200 palabras por respuesta), y 3.000 textos largos generados con BullshitGenerator a partir de 100 temas, usados para calibrar el registro y como conjunto de calibración del imatrix. La fase de RL emplea GRPO con pérdida CISPO, 6 muestras por grupo, 200 pasos y anclaje KL al modelo de SFT (β=0,1). La señal de recompensa no proviene de un clasificador convencional, sino de una comparación de verosimilitud bayesiana con un juez Spark-X2.5-1.7B: se compara la probabilidad de la respuesta bajo un prefijo "esto es literatura de relleno" frente a un prefijo "esto es sustantivo". Se añaden términos de forma de fluidez (penalización de repeticiones a nivel de subcláusula y de fragmento continuo, más una bonificación por diversidad de patrones). El reward medio pasó de 1,045 a 1,411 (+35 %) con KL siempre por debajo de 0,1. La poda se hizo con importancia de bloque al estilo ShortGPT (similitud coseno entre entrada y salida de capa) y una micro-recuperación de 79 segundos.

## Capacidades

- Generación de texto en chino con sintaxis correcta, puntuación adecuada y cero contenido informativo verificable.
- Dominio explícito de figuras de relleno: tautología ("X es X"), circularidad argumental y condicionales no operativos ("si no llueve, entonces llueve").
- Conversación multi-turno de dominio abierto, etiquetada como `conversational`, con calidad de respuesta uniformemente vacía.
- Diversidad retórica medida: 18 patrones de relleno detectados, con un índice de diversidad que sube de 1,5 a 2,2 tras el RL.
- Capacidad emergente no presente en los datos de entrenamiento: el modelo cita la fórmula "听君一席话，如听一席话" ("escuchar tus palabras es como escuchar tus palabras"), que solo aparecía en el criterio de evaluación del juez.
- No hay soporte documentado de tool calling ni function calling.
- No hay modo de razonamiento extendido (thinking), ni visión, ni audio, ni entrada multimodal.
- No hay capacidades multilingües: el modelo está entrenado y evaluado únicamente en chino.

## Casos de uso

- Relleno de texto de prueba en chino: generar párrafos largos, gramaticales y sin significado para maquetar interfaces, presentaciones o documentos de ejemplo donde un lorem ipsum latino no encaja por tipografía.
- Prueba de humo en CI/CD para pipelines de inferencia: sus 21-66 MB permiten validar tokenizador, carga de safetensors, conversión a GGUF y arranque de `llama-server` en segundos dentro de un contenedor, sin depender de pesos grandes.
- Banco de pruebas de cuantización y calibración imatrix: la model card publica PPL medido para seis niveles de cuantización sobre el mismo corpus, lo que permite reproducir la matriz y comparar implementaciones de cuantización con un modelo de tamaño trivial.
- Investigación educativa sobre RLAIF y reward hacking: el documento describe cómo una bonificación por "sinonimia repetida" incrementó la tasa de repetición en lugar de reducirla, un caso de estudio reproducible para cursos y equipos que diseñan funciones de recompensa.
- Aumento de datos para entrenar clasificadores de calidad textual: el modelo genera negativos etiquetados de forma natural (texto fluido pero vacío), útiles para detectores de contenido redundante o de baja densidad informativa.
- Docencia de arquitecturas y ciclo completo de entrenamiento: al apoyarse en minimind, permite recorrer pretrain, SFT, RL, cuantización y poda en un solo portátil, con checkpoints de 0,3 GB.
- Instalación artística y demostración interactiva: un chatbot que responde con solemnidad a cualquier pregunta es un recurso expositivo sobre la forma sin fondo en la generación automática.
- Pruebas de carga con CPU: su throughput medido en CPU permite saturar y medir servidores, colas y balanceadores con un coste energético mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra batería estándar de razonamiento o código en la información disponible. Los únicos datos cuantitativos publicados son la matriz de perplejidad por cuantización, medida sobre el propio corpus de relleno (f16 como referencia, 120,5) y las métricas del proceso de RL.

| Cuantización | Tamaño | PPL (menor es mejor) | Valoración del autor |
|---|---|---|---|
| f16 | 123 MB | 120,5 | Versión maestra |
| Q8_0 | 66 MB | ≈121 | Sin pérdida apreciable |
| Q4_K_M | 41 MB | 122,0 | Equilibrio correcto |
| IQ4_XS | 35 MB | 124,3 | Recomendada; 460 t/s en CPU i5-9500 |
| IQ2_M | 26 MB | 191,8 | Compresión extrema todavía utilizable |
| IQ1_S | 21 MB | 938,6 | Degradación severa; el modelo inventa caracteres |

| Métrica de entrenamiento | Valor |
|---|---|
| Recompensa media GRPO antes / después | 1,045 / 1,411 (+35 %) |
| Divergencia KL durante GRPO | < 0,1 |
| Pasos de RL | 200 (6 muestras por grupo) |
| Diversidad de patrones de relleno antes / después | 1,5 / 2,2 |
| PPL de la variante podada (49 M, 6 capas) tras recuperación | 660 (frente a 938,6 del equivalente de 8 capas en 1 bit) |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todas las configuraciones; entre 21 MB (IQ1_S) y 123 MB (f16) de pesos, más el espacio de caché KV.
- GPU recomendadas: cualquiera. El entrenamiento original se hizo en una Tesla P100 (16 GB) y una GTX 1080 (8 GB), ambas de 2016; para inferencia sobra con cualquier GPU de los últimos quince años.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX, GPU integrada o incluso en CPU pura y en dispositivos de placa única.
- Rendimiento medido: 460 tokens/s con IQ4_XS sobre un Intel i5-9500 en CPU, aproximadamente 2,2 ms por token.
- Opciones de despliegue documentadas: Transformers (safetensors) y llama.cpp / `llama-server` (GGUF). vLLM, TGI y Ollama no se mencionan en la documentación disponible, aunque el formato GGUF es compatible en principio con el ecosistema llama.cpp.
- Latencia y throughput más allá del dato anterior: no disponibles.

## Comparativa con modelos similares

No se conocen en la información disponible otros modelos publicados cuyo objetivo declarado sea generar texto sin información; las alternativas comparables son el propio linaje del modelo y su variante podada.

| Modelo | Parámetros | Capas | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Feihua-n1-64M | 63,91 M | 8 | No declarado (ejemplo con 8192) | PPL 124,3 en IQ4_XS (35 MB) | Apache-2.0 |
| Feihua-n1-64M-prune | 49 M | 6 | No declarado | PPL 660 tras recuperación, desde 17 MB | Apache-2.0 |
| jingyaogong/minimind-3 | 64 M (misma escala; el autor no detalla variante) | No disponible | No disponible | No disponible en esta información | Apache-2.0 |
| BullshitGenerator (generador por plantillas) | No aplica (reglas) | No aplica | No aplica | Cobertura cerrada: 107 nombres y 36 plantillas | No disponible |

## Limitaciones y advertencias

- El modelo no produce información útil por diseño. Cualquier expectativa de respuesta factual, cálculo o asistencia real queda fuera de su comportamiento esperado.
- No obedece instrucciones del tipo "responde en serio": su comportamiento evaluado indica que considera que ya responde en serio.
- En preguntas matemáticas genera demostraciones circulares del estilo "la raíz es raíz porque es raíz", sin valor probatorio.
- Puede, con probabilidad baja pero no nula, emitir una frase con contenido útil; el autor lo clasifica explícitamente como error y pide que se reporte.
- No hay evaluación de sesgos publicada. Al no afirmar hechos, el riesgo de difamación o de fuga de datos es bajo, pero tampoco se ha auditado el corpus de destilación.
- El alcance lingüístico se limita al chino; no hay evidencia de comportamiento correcto en otros idiomas, incluido el castellano.
- La longitud de contexto no está declarada oficialmente; el valor de 8192 procede únicamente del ejemplo de arranque y no debe asumirse como especificación.
- Con cuantizaciones de 1 bit (IQ1_S) la degradación es severa (PPL 938,6) y el modelo genera caracteres inexistentes; no se recomienda en producción.
- La poda agresiva sin recuperación destruye el modelo (PPL de 120 a 1795); la variante podada solo es viable con el fine-tuning de recuperación de 79 segundos.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia total de fiabilidad funcional hace desaconsejable integrarlo en un producto que no sea de pruebas, docencia o entretenimiento.
- Los metadatos del repositorio indican 0 descargas y 0 valoraciones, por lo que no existe validación externa de los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZZRI/Feihua-n1-64M
- Variante podada: https://huggingface.co/ZZRI/Feihua-n1-64M-prune
- Framework y modelo base minimind: https://github.com/jingyaogong/minimind
- Generador de textos usado en el corpus: https://github.com/menzi11/BullshitGenerator

La búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo, su paper o sus autores; los resultados obtenidos no guardan relación con el contenido de la ficha.
