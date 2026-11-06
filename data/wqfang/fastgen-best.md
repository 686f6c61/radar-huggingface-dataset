# wqfang/fastgen-best

## Resumen

FastGen es un conjunto de pesos de un modelo de generación de imágenes por difusión, concretamente una adaptación de rectified flow destilada para generar imágenes en muy pocos pasos (1 y 4 evaluaciones de función de red, NFE). Lo publica el usuario wqfang bajo el identificador `wqfang/fastgen-best`, y según su model card se trata de los "pesos ganadores retenidos" de un proyecto de curso ("Andy's retained one-call and four-call winners"), entrenado sobre un pipeline de curso desde cero y evaluado con un evaluador local de FID sobre un conjunto de Pokémon.

El modelo resuelve el problema de la inferencia lenta en modelos de difusión: en lugar de decenas de pasos, ofrece un checkpoint de 1 paso (FID local medio de 36,3980) y otro de 4 pasos (FID local medio de 22,4970). Con 93.746.051 parámetros, es un modelo pequeño, orientado a experimentación docente y a la reproducción de recetas de destilación (RF-SiD, DMD2, destilación progresiva), no a producción general.

Es relevante ahora porque ejemplifica las técnicas de destilación de difusión de muy pocos pasos aplicadas a un dominio concreto (Pokémon), pero conviene subrayar que no es un modelo de propósito general: su licencia no está definida, el código es privado y los resultados son mediciones locales no certificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión basado en rectified flow (RF) con destilación; backbone no especificado en detalle en la model card |
| Parametros totales | 93.746.051 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (generación de imágenes) |
| Tipos de cuantizacion | no disponible; la model card indica FP32 para el modelo de 1 paso y BF16 en CUDA para el backbone del de 4 pasos |
| Idiomas soportados | en (etiqueta de idioma; el modelo genera imágenes, no texto) |
| Licencia | no disponible (el autor no ha seleccionado licencia de redistribución; paquete destinado al equipo privado del curso) |
| Formato de pesos | checkpoints `.ckpt` y anclas `.pt` (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

La model card describe un pipeline de difusión con formulación de rectified flow, destilado mediante adaptaciones propias de tres métodos: RF-SiD (arxiv:2509.25127), DMD2 (arxiv:2405.14867) y destilación progresiva (arxiv:2202.00512). El autor aclara explícitamente que son adaptaciones específicas del proyecto y no reproducciones completas de esos papers. El paquete incluye dos checkpoints exportados (`checkpoints/one_nfe.ckpt`, `checkpoints/few_nfe.ckpt`) y dos anclas de entrenamiento (`anchors/plain3500.pt`, `anchors/ttur1000.pt`) que sirven para inicializar etapas finales frescas de SiD y de intervalo, respectivamente.

El entrenamiento parte de un pipeline de curso entrenado desde cero. El checkpoint de 1 paso corresponde a "Retained RF-SiD2000 EMA0" y el de 4 pasos a "Retained TTUR-to-interval500 EMA". Se menciona un profesor congelado de 40k pasos y 9.664 pares de regresión aportados por otra colaboradora ("Alina"), que no se redistribuyen en este repositorio. No se especifica el número de tokens ni la composición exacta del dataset, salvo el dominio (Pokémon) y la ausencia de imágenes de dataset en el paquete. Las anclas son pesos seleccionados, no reanudaciones completas de optimizador. Los comandos de reentrenamiento portátiles incluidos están probados solo en CPU y no se han reentrenado en GPU para reproducir los FID publicados.

## Capacidades

- Generación de imágenes de dominio Pokémon mediante destilación de difusión en 1 y 4 pasos.
- Inferencia de muy bajo NFE: 1 evaluación de función de red (modelo `one_nfe.ckpt`) y 4 NFE (modelo `few_nfe.ckpt`).
- El modelo de 4 pasos requiere `r=0` con avances fijos de `.25` y forwarding del backbone en BF16 sobre CUDA; el de 1 paso usa FP32.
- El evaluador Inception se mantiene en FP32 en ambos casos.
- No se documentan capacidades de texto, código, matemáticas, visión comprensiva, tool calling, agentes ni multilingüismo; es exclusivamente un generador de imágenes.
- No se documenta modo thinking, audio ni otras modalidades.

## Casos de uso

- Reproducción de experimentos de destilación de difusión: el paquete incluye anclas y comandos de replay de la etapa final para volver a ejecutar la receta y exportar nuevos candidatos, útil en docencia e investigación de métodos de pocos pasos.
- Generación rápida de imágenes de Pokémon en 1 paso: adecuado para prototipos de aplicaciones de arte generativo donde la latencia importa más que la fidelidad máxima (FID local 36,3980).
- Generación de mayor calidad en 4 pasos: para demos o pipelines internos que toleran 4 NFE y buscan mejor FID (22,4970) manteniendo un coste bajo.
- Estudio comparativo de métodos de destilación (RF-SiD, DMD2, destilación progresiva): sirve como caso base para medir el efecto de cada técnica en un dominio acotado.
- Evaluación de pipelines de muestreo: al requerir metadatos de sampler concretos (`r=0`, avances fijos de `.25`), es útil para validar implementaciones de samplers y su sensibilidad a la configuración.
- Material de curso y formación: el repositorio y las instrucciones de reproducción (`REPRODUCE_BEST.md`) están pensados para que el equipo del curso replique resultados y verifique artefactos con SHA256 y tamaños en `artifacts.json`.

## Benchmarks y rendimiento

Los únicos datos disponibles son mediciones locales de FID del propio autor, no certificadas por el evaluador del curso (TA) ni por un leaderboard:

| Modelo | FID local medio | NFE | Notas |
|---|---:|---:|---|
| checkpoints/one_nfe.ckpt | 36,3980 | 1 | RF-SiD2000 EMA0; FP32 |
| checkpoints/few_nfe.ckpt | 22,4970 | 4 | TTUR-to-interval500 EMA; BF16 backbone en CUDA, r=0, avances fijos .25 |

Las puntuaciones se calculan con el evaluador del curso sin modificar, sobre 3.020 imágenes generadas/de referencia y semillas 123/456/789. Los resultados por semilla, SHA256 y tamaños en bytes están en `artifacts.json`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 93,7 M de parámetros, el peso en FP32 ocupa aproximadamente 375 MB y en BF16 unos 187 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante), si bien no se documentan requisitos oficiales.
- GPU recomendadas: no disponible; la model card solo exige CUDA con BF16 para el modelo de 4 pasos y FP32 para el de 1 paso.
- Cabe en GPU consumer: sí, por tamaño de parámetros, aunque no hay confirmación oficial de compatibilidad ni de latencia.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el paquete se distribuye como checkpoints `.ckpt`/`.pt` para usar con el código emparejado (repositorio privado `fastgen-team`).
- Latencia y throughput: no disponibles; por diseño, el modelo de 1 NFE es el de menor coste computacional y el de 4 NFE multiplica por cuatro las evaluaciones de red.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, los métodos citados en la model card (RF-SiD, DMD2, destilación progresiva) son las familias de técnicas con las que se compara conceptualmente este trabajo, pero no se aportan resultados de esos métodos sobre el mismo conjunto para establecer una comparación numérica.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wqfang/fastgen-best | 93.746.051 | no aplica | FID local 36,3980 (1 NFE) y 22,4970 (4 NFE) | no disponible | Hugging Face, código privado |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no definida: el autor no ha seleccionado licencia de redistribución y el paquete está destinado al equipo privado del curso; no hay autorización clara para uso comercial ni redistribución.
- Código privado: el repositorio `fastgen-team` referenciado es privado, lo que limita la reproducibilidad externa pese a que se indica un commit fijado.
- Resultados no certificados: los FID son mediciones locales del autor, no resultados de leaderboard ni verificados por terceros.
- Dominio muy restringido: entrenado sobre Pokémon; no es un modelo de generación de imágenes de propósito general.
- Sin imágenes de dataset ni profesor original: no se redistribuyen las imágenes ni el profesor congelado de 40k pasos ni los 9.664 pares de regresión, por lo que la reproducción completa no es posible solo con este paquete.
- Dependencia estricta del sampler: el modelo de 4 pasos exige `r=0`, avances fijos de `.25` y BF16 en CUDA; desviarse de esa configuración puede degradar los resultados.
- Reentrenamiento no validado en GPU: los comandos portátiles están probados solo en CPU y no reproducen los FID publicados; además no repiten la selección histórica sobre el holdout interno.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; al ser un generador de imágenes de un dominio concreto, puede reproducir sesgos y artefactos del dataset de entrenamiento.
- Idiomas: la etiqueta es `en`, pero el modelo no procesa texto; no hay soporte multilingüe relevante.
- Sin garantías de producción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wqfang/fastgen-best
- Código (privado): https://github.com/andy-wqfang/fastgen-team/tree/00ac44270f1a94887f61f404f551b8e947569b8a
- Instrucciones de reproducción: https://github.com/andy-wqfang/fastgen-team/blob/00ac44270f1a94887f61f404f551b8e947569b8a/REPRODUCE_BEST.md
- Paper RF-SiD: https://arxiv.org/abs/2509.25127
- Paper DMD2: https://arxiv.org/abs/2405.14867
- Paper Progressive Distillation: https://arxiv.org/abs/2202.00512
