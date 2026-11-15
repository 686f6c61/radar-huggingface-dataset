# TyPlant/BurrowEssay-LoRA

## Resumen

BurrowEssay-LoRA es un adaptador LoRA de bajo rango (r16, alpha 32) diseñado para que el modelo base Ternary-Bonsai-2-27B escriba ensayos argumentativos y reflexivos con una voz "humana" y sin inventar datos biográficos sobre el usuario. Lo desarrolla TyPlant como parte del proyecto Burrow, una aplicación de escritorio que ejecuta modelos de lenguaje en local, y actúa como el motor de la función "Write" de dicha aplicación. Es, por tanto, una pieza de un producto orientado a la escritura asistida offline, no un modelo generalista autónomo.

El adaptador se distribuye en formato GGUF (f16, 233 MB) y no está fusionado con el modelo base, lo que permite cargarlo y descargarlo dinámicamente junto a otros adaptadores (como BurrowBrief) sin recargar el modelo principal. El modelo base es Ternary-Bonsai-2-27B en cuantización PTQ1_0 (ternaria), un modelo de 27.000 millones de parámetros que, gracias a la cuantización ternaria, puede ejecutarse en GPUs de consumo como una RTX 4060 de 8 GB, según las pruebas del autor.

La relevancia de este adaptador radica en su enfoque: un ajuste supervisado seguido de una ronda de DPO (372 pares de preferencia, 2 épocas) orientada específicamente a reducir la invención de hechos sobre el usuario. El autor reporta mejoras medibles en ese aspecto (de 30 a 5 salidas con biografía inventada en una muestra de 78 peticiones), aunque reconoce que aún no alcanza el objetivo estricto del proyecto (36% de ensayos marcados frente a un objetivo del 5% o menos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer del modelo base Ternary-Bonsai-2-27B |
| Parametros totales | 116.727.808 (adaptador); modelo base: 27B (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k en el modelo base; Burrow limita a 20k con ambos adaptadores instalados; ejemplo de uso con -c 6144 |
| Tipos de cuantizacion | Adaptador en f16 GGUF; modelo base en PTQ1_0 (ternaria) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible para el adaptador; el modelo base es Apache-2.0; los datos de entrenamiento provienen de un modelo profesor alojado, cuyos términos deben verificarse antes de redistribuir los pesos |
| Formato de pesos | GGUF (adaptador LoRA sin fusionar); modelo base GGUF PTQ1_0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32, almacenado en f16 GGUF y no fusionado con el modelo base. Se aplica sobre Ternary-Bonsai-2-27B, un transformer de 27.000 millones de parámetros cuantizado en formato ternario (PTQ1_0), lo que reduce drásticamente los requisitos de memoria. El entrenamiento consistió en un ajuste supervisado (SFT) sobre ensayos generados por un modelo profesor alojado, seguido de una ronda de DPO con 372 pares de preferencia durante 2 épocas, centrada en evitar la invención de hechos sobre el usuario. El prompt de sistema con el que se entrenó instruye explícitamente a no inventar estadísticas, estudios, citas ni fuentes, y a limitarse a los hechos proporcionados por el usuario.

Una innovación destacable es el modo de razonamiento ("thinking") activado: el modelo genera un plan breve (afirmación, lector, razones, objeción, longitud) antes de escribir el ensayo. El adaptador está pensado para cargarse junto a un segundo adaptador (BurrowBrief) y alternarse por petición sin recargar el modelo base, lo que permite tener varias habilidades especializadas sobre una misma instancia del modelo. El autor probó el adaptador en una RTX 4060 de 8 GB, obteniendo unos 26 tokens por segundo con el adaptador activo.

## Capacidades

- Generación de ensayos argumentativos y reflexivos en inglés, con una voz natural y humana.
- Modo de razonamiento ("thinking"): produce un plan estructurado (afirmación, lector, razones, objeción, longitud) antes de redactar.
- Control de longitud: entrenado para respetar la longitud solicitada por el usuario (74,6% de acierto en el conjunto de validación congelado).
- Reducción de invención de hechos biográficos: entrenado con DPO para no añadir datos personales no proporcionados por el usuario.
- Soporte de instrucciones de formato, audiencia y tono.
- Capacidad de escribir como narrador inventado si el usuario no aporta datos personales y no pide lo contrario.
- No entrena para ensayos de solicitud (application essays) ni ficción.
- Soporte multilingüe limitado al inglés.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Redacción de ensayos de opinión en local: el adaptador permite generar ensayos argumentativos con una estructura planificada (claim, razones, objeción) y una voz humana, ejecutándose en una GPU de consumo sin enviar datos a la nube.
- Asistencia a la escritura personal sin fuga de datos: al correr sobre una RTX 4060 de 8 GB, el usuario puede redactar textos reflexivos sobre su propia experiencia sin que la información salga de su equipo, con la garantía adicional de que el adaptador fue entrenado para no inventar datos biográficos.
- Generación de borradores para blogs o newsletters: el control de longitud y la instrucción de seguir el formato y la audiencia solicitados lo hacen adecuado para producir borradores ajustados a una extensión concreta, que luego el usuario revisa y edita.
- Integración en la aplicación Burrow: el adaptador se carga junto a BurrowBrief en el directorio `models/bonsai2/` y se activa por petición sin recargar el modelo base, lo que permite alternar entre tareas de escritura de ensayos y de resumen de correos en una misma sesión.
- Experimentación con adaptadores LoRA sobre modelos ternarios: investigadores pueden usar este adaptador como ejemplo de SFT + DPO sobre un modelo base cuantizado en PTQ1_0, con un tamaño de solo 233 MB, para estudiar el efecto del ajuste en la fidelidad factual.
- Evaluación de mitigación de alucinaciones biográficas: el adaptador y sus métricas reportadas (5 salidas inventadas frente a 30 de la versión anterior en 78 peticiones) sirven como caso de estudio para medir la eficacia de una ronda de DPO dirigida a un fallo concreto.
- Prototipado de asistentes de escritura offline en hardware modesto: con 26 tokens/s en una RTX 4060, es viable construir demos interactivas de generación de ensayos sin infraestructura de servidor.

## Benchmarks y rendimiento

El autor reporta evaluaciones propias, no reproducidas de forma independiente:

| Metrica | BurrowEssay-LoRA | Version anterior |
|---|---|---|
| Biografia inventada (78 peticiones, conteo manual) | 5 salidas (9 adicionales borderline) | 30 salidas |
| Longitud dentro de lo solicitado (conjunto congelado) | 74,6% | 71,2% |
| Voz humana (comparación por pares en ensayos personales) | Al menos igual de humana | Referencia |
| Ensayos marcados por la comprobación automática estricta de hechos inventados (dev) | 36% (objetivo: ≤5%) | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 233 MB; el modelo base en PTQ1_0 cabe en 8 GB según las pruebas del autor. Con contexto de 32k y ambos adaptadores (BurrowEssay + BurrowBrief) no cabe en una tarjeta de 8 GB, por lo que Burrow limita el contexto a 20k.
- GPU recomendadas: RTX 4060 8 GB (probada por el autor, ~26 tokens/s con el adaptador activo). No se documentan pruebas en A100, H100 u otras GPUs.
- Cabe en GPU de consumo: sí, al menos en RTX 4060 8 GB con contexto limitado.
- Opciones de despliegue: llama.cpp (build de PrismML, el autor evaluó b12128; Burrow incluye la build 10777), mediante `llama-server` con `--lora`. No se documenta soporte en vLLM, TGI u Ollama.
- Latencia y throughput: ~26 tokens/s en RTX 4060 8 GB con el adaptador activo (dato del autor).
- Parámetros de muestreo recomendados: temp 0.8, top-p 0.95, top-k 20, `reasoning_effort: low`, `-fa on`, `--jinja`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BurrowEssay-LoRA | 116,7M (adaptador) sobre base 27B | 32k base; 20k con ambos adaptadores | no disponible (base Apache-2.0) | GGUF LoRA | Especializado en ensayos en inglés, DPO contra invención biográfica |
| BurrowBrief-LoRA | no disponible | no disponible | no disponible | GGUF LoRA | Mismo autor, mismo modelo base; especializado en correos y resúmenes |
| Ternary-Bonsai-2-27B (base) | 27B | 32k | Apache-2.0 | GGUF PTQ1_0 | Modelo generalista sin el ajuste de estilo ni la mitigación de invención |

No se dispone de información sobre otros adaptadores comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Aún falla la comprobación automática estricta de hechos inventados del proyecto: el 36% de los ensayos de desarrollo fueron marcados, frente a un objetivo del 5% o menos. El autor recomienda leer los ensayos sobre uno mismo antes de usarlos.
- Muletilla recurrente: la estructura "the strongest objection is…" aparece con frecuencia en ensayos argumentativos, heredada del modelo profesor.
- Pérdida de longitud: aproximadamente uno de cada cuatro ensayos queda fuera de la longitud solicitada.
- No entrenado para ensayos de solicitud (application essays) ni para ficción.
- Evaluado en la build b12128 de llama.cpp de PrismML; Burrow incluye la build 10777, donde carga y escribe pero no se volvió a medir la calidad.
- Solo inglés.
- Licencia del adaptador no disponible; los datos de entrenamiento provienen de un modelo profesor alojado, por lo que deben revisarse los términos de ese proveedor antes de redistribuir los pesos. El modelo base es Apache-2.0.
- Riesgo de alucinación persistente en datos factuales, aunque el DPO reduce la invención de datos biográficos.
- Punto de control en desarrollo ("work-in-progress checkpoint"), no una versión final.
- Sin soporte documentado de tool calling, agentes o multimodalidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/TyPlant/BurrowEssay-LoRA
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Adaptador hermano BurrowBrief: https://huggingface.co/TyPlant/BurrowBrief-LoRA
- Sitio del proyecto Burrow: https://getburrow.run/
- Descarga de la aplicación Burrow: https://getburrow.run/#download
