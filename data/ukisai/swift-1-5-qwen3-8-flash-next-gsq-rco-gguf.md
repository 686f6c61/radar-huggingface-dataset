# ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Swift 1.5 Qwen3.8-Flash-Next · GSQ-RCO es el repositorio de cuantizaciones GGUF de precisión mixta que UkisAI publica sobre su modelo Swift Flash Next, un derivado de razonamiento eficiente de Qwen3.8-Flash-Next. No contiene pesos nuevos ni un modelo entrenado desde cero: son tres niveles de cuantización —IQ3_XXS, IQ2_XS y Q2_0 (experimental)— construidos con refinamiento GSQ propio e imatrix, y con perfiles de asignación por tensor GSQ-RCO reutilizados de ISTA-DASLab, pensados para ejecución local con llama.cpp.

El modelo subyacente es un MoE de 176.943.899.520 parámetros (≈176,9 B) en BF16, con pipeline image-text-to-text y un proyector visual BF16 de 0,91 GB distribuido aparte. Su entrenamiento posterior está orientado a trazas de razonamiento más cortas y a tareas de código, agentes y horizonte largo; según el autor, reduce el consumo de tokens de pensamiento un 63,4 % con una aceleración de 1,8x y una pérdida de precisión inferior al 1 % frente al modelo base en el ajuste xhigh.

La relevancia práctica está en el empaquetado: los tres niveles ocupan entre 66,55 GB y 75,97 GB, lo que permite servir un MoE de 177 B en configuraciones multi-GPU o con descarga parcial a CPU, algo inviable en BF16 (212,2 GB de repositorio). El repositorio está sujeto a acceso restringido mediante cuenta autorizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre Qwen3.8-Flash-Next, con atención híbrida GDN + QSA según la documentación del modelo base |
| Parámetros totales | 176.943.899.520 (≈176,9 B) en BF16 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ3_XXS, IQ2_XS, Q2_0 (experimental); proyector visual BF16 independiente |
| Idiomas soportados | no disponible (los conjuntos de evaluación KLD cubren inglés, alemán, francés, español y chino) |
| Licencia | swift-open-license-1.0 (license: other); licencia empresarial separada |
| Formato de pesos | GGUF (llama.cpp), dos shards por nivel |
| Tamaño del repositorio | 212,2 GB |
| Descargas / likes | 395 / 15 |
| Fecha de publicación | 24 de septiembre de 2026 (última actualización el mismo día) |

## Arquitectura y entrenamiento

El modelo base de esta cuantización es Swift Flash Next, derivado de razonamiento eficiente de Qwen3.8-Flash-Next. La documentación de Qwen3.8-Flash-Next en GitHub describe una actualización sistemática en cuatro ejes —atención, residual, embedding y optimización— con una arquitectura de atención híbrida GDN + QSA, orientada a mejorar capacidad y eficiencia de cómputo. UkisAI aplica sobre esa base un post-training cuyo objetivo declarado son trazas de razonamiento más cortas y mejor rendimiento en código, agentes y tareas de horizonte largo. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La innovación de este repositorio concreto es de cuantización, no de entrenamiento. Los GGUF se generan con refinamiento GSQ (tag imatrix) y reutilizan perfiles de asignación por tensor GSQ-RCO de ISTA-DASLab, dando como resultado tres niveles de precisión mixta. Cada nivel se reparte en dos shards que deben descargarse en el mismo directorio; llama.cpp localiza el segundo automáticamente. Las identidades exactas de modelo y shard quedan registradas en `release-manifest.json` y `SHA256SUMS`, y los ficheros GGUF originales sin dividir pueden reconstruirse byte a byte mediante los ficheros y el script de `exact-source-recovery/`.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Razonamiento con trazas de pensamiento reducidas: `efficient-thinking` y `token-efficient`, con un 63,4 % menos de tokens de pensamiento según el autor.
- Codificación, agentes y tareas de horizonte largo como objetivos explícitos del post-training.
- Entrada de imagen a texto (pipeline `image-text-to-text`) mediante el proyector visual BF16 `mmproj-Swift-Qwen3.8-Flash-Next-BF16.gguf` de 0,91 GB.
- Compatibilidad declarada con endpoints de inferencia (tag `endpoints_compatible`).
- Multilingüismo: no disponible como lista oficial, aunque los conjuntos de evaluación KLD incluyen inglés, alemán, francés, español y chino.
- Soporte de tool calling o function calling: no se documenta en la información disponible.

## Casos de uso

- Inferencia local de un MoE de 177 B en clústeres pequeños: con IQ2_XS (68,15 GB) el modelo cabe en dos GPU de 80 GB, lo que permite servir razonamiento de gran tamaño sin depender de API externa.
- Asistentes de código en producción: el post-training del modelo base está orientado explícitamente a tareas de código y el nivel IQ3_XXS tiene el KLD más bajo en CodeParrot (0,118707) entre los tres niveles publicados.
- Agentes de múltiples pasos con presupuesto de tokens ajustado: la reducción declarada del 63,4 % en tokens de pensamiento abarata cada iteración del bucle agéntico, donde el coste se multiplica por el número de pasos.
- Análisis de documentos con componente visual: capturas, diagramas o formularios pueden procesarse cargando el proyector BF16 junto al shard 1 del modelo, siempre que el pipeline `image-text-to-text` esté soportado en la build de llama.cpp utilizada.
- Razonamiento matemático en local: GSM8K es el dominio con menor KLD de los ocho evaluados (0,086821 en IQ3_XXS, 0,120991 en IQ2_XS), lo que lo hace adecuado para tutoría o verificación de cálculos.
- Investigación en cuantización: los ficheros de recuperación exacta y las tablas KLD publicadas permiten reproducir la evaluación y comparar perfiles de asignación por tensor frente a las cuantizaciones GSQ-RCO de ISTA-DASLab.
- Servicio interno multiidioma: con cobertura de evaluación en alemán, francés, español y chino, es viable para atención interna en esas lenguas, asumiendo que no hay garantía formal de calidad fuera de los conjuntos medidos.
- Despliegue con descarga parcial a CPU: en equipos con mucha RAM de sistema y una GPU de 24 GB, llama.cpp puede repartir capas y ejecutar IQ2_XS a velocidad reducida.

## Benchmarks y rendimiento

Tamaño y divergencia global por nivel. KLD mide la divergencia respecto a la distribución del siguiente token del modelo BF16 correspondiente; menor es mejor:

| Nivel | Tamaño GGUF combinado | Shards | KLD de desarrollo |
|---|---:|---|---:|
| IQ3_XXS | 75,97 GB | 2 | 0,240139 |
| IQ2_XS | 68,15 GB | 2 | 0,341275 |
| Q2_0 (experimental) | 66,55 GB | 2 | 0,424350 |

KLD por dominio (contexto 512; 100 fragmentos en prosa, código y matemáticas, 25 en los idiomas):

| Conjunto de evaluación | IQ3_XXS | IQ2_XS | Q2_0 (experimental) |
|---|---:|---:|---:|
| Prosa en inglés | 0,116077 | 0,188117 | 0,234242 |
| Muestra inglesa nueva | — | 0,186271 | 0,236228 |
| Código CodeParrot | 0,118707 | 0,174294 | 0,235256 |
| Texto matemático GSM8K | 0,086821 | 0,120991 | 0,149809 |
| Alemán | 0,109100 | 0,166814 | 0,219444 |
| Francés | 0,133624 | 0,213379 | 0,300467 |
| Español | 0,073681 | 0,119114 | 0,148757 |
| Chino | 0,174102 | 0,264923 | 0,385924 |

Comparaciones declaradas por el autor: IQ2_XS presenta KLD inferior al IQ2_XS de ISTA-DASLab en siete de ocho conjuntos (entre un 5 % y un 11 %; −8,9 % en texto matemático y −10,5 % en chino) y mejora su cuantización de partida en todos los dominios (8-17 %). IQ3_XXS mejora su cuantización de partida en seis de siete dominios (3-16 %) y supera al IQ3_XXS de ISTA en texto matemático (−7,8 %) y chino (−5,1 %), con el resto de dominios dentro del 1-4 %. Q2_0 es experimental y empeora respecto al Q2_0 de ISTA en seis de ocho conjuntos. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K como exactitud) en la información disponible.

## Requisitos de hardware

- VRAM estimada: IQ2_XS 68,15 GB de pesos + 0,91 GB de proyector ≈ 70-80 GB con caché; IQ3_XXS 75,97 GB ≈ 78-90 GB; Q2_0 66,55 GB ≈ 68-80 GB. Los tamaños son en GB decimales y excluyen memoria de contexto y caché en tiempo de ejecución.
- GPU recomendadas: 2x A100 80 GB, 2x H100 80 GB o 2x H200 para IQ2_XS e IQ3_XXS. Con 4x RTX 4090 (96 GB) o 4x RTX 3090 podría alojarse IQ2_XS, sujeto a soporte de reparto en la build de llama.cpp.
- GPU de consumo: no cabe en una sola GPU de consumo. Como alternativa, llama.cpp permite descargar capas a CPU y ejecutar con mucha RAM de sistema más una GPU de 24 GB, a costa de latencia.
- Opciones de despliegue: llama.cpp y llama-server son los soportes documentados explícitamente. El tag `endpoints_compatible` apunta a uso desde endpoints de inferencia, pero vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponible en términos absolutos. El autor reporta una aceleración de 1,8x y menos del 1 % de pérdida de precisión en Swift 1.5 Flash Next respecto al base, medidas sobre el modelo, no sobre estas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y tamaño | KLD en prosa inglesa | Licencia |
|---|---|---|---|---|---|
| Swift 1.5 Flash-Next GSQ-RCO IQ3_XXS | ≈176,9 B | no disponible | GGUF, 75,97 GB | 0,116077 | swift-open-license-1.0 |
| Swift 1.5 Flash-Next GSQ-RCO IQ2_XS | ≈176,9 B | no disponible | GGUF, 68,15 GB | 0,188117 | swift-open-license-1.0 |
| Swift 1.5 Flash-Next GSQ-RCO Q2_0 | ≈176,9 B | no disponible | GGUF, 66,55 GB | 0,234242 | swift-open-license-1.0 |
| Swift Flash Next BF16 (referencia) | ≈176,9 B | no disponible | safetensors/BF16, no disponible | 0 (referencia) | swift-open-license-1.0 |
| Cuantizaciones GSQ-RCO de ISTA-DASLab (mismos niveles) | no disponible | no disponible | GGUF, no disponible | peor que IQ2_XS de Swift en 7 de 8 conjuntos | no disponible |
| Swift-Qwen3.8-27B | 27 B | no disponible | no disponible | no disponible | swift-open-license-1.0 |

La comparación con ISTA-DASLab usa la referencia BF16 propia de cada modelo y, según el autor, no constituye un ranking de capacidad ni porcentajes de exactitud en tareas. Swift-Qwen3.8-27B es un modelo distinto dentro de la misma familia (27 B, con un 58,3 % menos de tokens de pensamiento y 1,95x de aceleración declarados), incluido solo como referencia de línea.

## Limitaciones y advertencias

- Licencia `swift-open-license-1.0` bajo `license: other`: revisar el texto completo antes de cualquier uso comercial; existe una vía de licencia empresarial separada.
- Acceso restringido: el repositorio exige autenticación con una cuenta autorizada, lo que puede limitar su uso en despliegues automatizados.
- Las métricas publicadas son KLD, no exactitud en tareas. Un KLD bajo no garantiza buen rendimiento en un dominio concreto.
- El nivel Q2_0 está marcado como experimental y tiene KLD superior al Q2_0 de ISTA en seis de ocho conjuntos; para un tamaño similar el propio autor recomienda IQ2_XS.
- Sin comparación disponible para IQ3_XXS en la muestra inglesa nueva, lo que impide verificar generalización en ese nivel.
- La evaluación de visión no está cubierta: las tablas miden solo inferencia de texto, por lo que la calidad en tareas de imagen es desconocida.
- No se establece calidad en contexto largo; las mediciones se hicieron con contexto de 512 tokens.
- El filtrado por solapamiento léxico no demuestra deduplicación semántica ni ausencia de sobreajuste en los conjuntos de evaluación.
- Riesgo de alucinación: no hay datos específicos publicados para este modelo; es una advertencia general aplicable a modelos de razonamiento con trazas comprimidas.
- Idiomas oficialmente soportados: no disponible. La cobertura de evaluación en alemán, francés, español y chino no equivale a una declaración de soporte.
- Sin información sobre sesgos, datos de entrenamiento ni procesos de alineación del modelo base.
- Cada nivel requiere descargar ambos shards; cargar solo el primero provoca fallo de carga.
- El tamaño del repositorio (212,2 GB) implica un coste de almacenamiento y ancho de banda considerable para probar los tres niveles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/LICENSE
- Aviso legal: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/NOTICE
- Sumas de verificación: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/SHA256SUMS
- Modelo BF16 base: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- GGUF estándar: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Web del autor: https://ukisai.com
- Página de producto Swift: https://ukisai.com/products/swift
- Anuncio de la familia Swift: https://ukisai.com/news/introducing-swift
- Comparativa interactiva Flash Next: https://ukisai.com/swift-games/flash-next
- Repositorio de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- arXiv 2604.18556: https://arxiv.org/abs/2604.18556
- arXiv 2605.00649: https://arxiv.org/abs/2605.00649
