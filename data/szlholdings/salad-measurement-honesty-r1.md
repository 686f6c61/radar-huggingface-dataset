# SZLHOLDINGS/salad-measurement-honesty-r1

## Resumen

`salad-measurement-honesty-r1` es un adaptador LoRA (PEFT) alojado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-Coder-3B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos delta de 59.021.064 bytes (~59 MB) empaquetados en safetensors, pensados para cargarse sobre el modelo base de 3.000 millones de parámetros. La model card lo describe explícitamente como un candidato privado de investigación, no cualificado para producción y no elegible para publicación pública según la evidencia registrada.

El interés de esta ficha no reside en sus capacidades (no hay ninguna evaluada ni documentada), sino en su valor como ejemplo de trazabilidad y gobernanza de artefactos. La model card incluye hashes SHA-256 del adaptador, de su configuración y del estado del entrenador, junto con un registro de inspección legible por máquina. Al mismo tiempo, documenta limitaciones de procedencia serias: la revisión del modelo base no está fijada, el dataset de entrenamiento no está verificado y existe una discrepancia entre el modelo base declarado en el adaptador (Qwen2.5-Coder-3B-Instruct) y el configurado en el job de entrenamiento (Qwen3-1.7B).

El adaptador se entrenó hasta el paso global 200 de 200 según `checkpoint-200/trainer_state.json`, pero el autor advierte que ese metadato no demuestra ejecución real, identidad autenticada del trabajador ni calidad de generalización. No se declara ninguna métrica de precisión, velocidad, energía o benchmark. Es, por tanto, un artefacto de investigación con procedencia incompleta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-3B-Instruct |
| Parámetros totales | No disponible para el adaptador (base: 3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base, no declarada) |
| Tipos de cuantización | No disponible (adaptador en safetensors; cuantización del base no especificada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`final/adapter_model.safetensors`) |
| Tamaño del adaptador | 59.021.064 bytes |
| SHA-256 del adaptador | `94397e59e470fe45dc968837cdbf8f1d32848dde3c5278da0f7ea00a08397a1c` |
| SHA-256 de la config | `34ce7a13b83487a6e403107616f17595e077c71a8e6e7cbe5d5e85897756b58a` |
| Revisión inspeccionada | `057eb8fb1189ac7ef5367c716643f5646c3b8b36` |
| Revisión del modelo base | No fijada |
| Paso global de entrenamiento | 200 / 200 |
| Estado de producción | `production_qualified: false` |
| Elegibilidad de publicación | `publication_eligible: false` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros orientado a código. El adaptador ocupa unos 59 MB, lo que es coherente con un rango LoRA bajo aplicado a un subconjunto de capas del modelo base. No se especifica en la información disponible el rango, el alfa, las capas objetivo ni el dropout del adaptador.

El entrenamiento registrado alcanza `global_step=200` con `max_steps=200`, según `checkpoint-200/trainer_state.json` (SHA-256 `16bceb45378f69f37f8af0d2b43503a6fc7462ccd820a82421611ee5b678386f`). No se documenta el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o SFT. El autor indica explícitamente que el dataset real y su revisión inmutable permanecen sin verificar y que no debe inferirse a partir del nombre del repositorio. Tampoco se declara ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.).

La model card señala una discrepancia de linaje: el configurado guardado para el job `szl-train-khipu-r2-r1` nombra `Qwen/Qwen3-1.7B`, mientras que el `adapter_config.json` del adaptador nombra `Qwen/Qwen2.5-Coder-3B-Instruct`. El autor advierte de no reanudar ni cargar el adaptador sobre el base con nombre distinto hasta resolver el linaje del run.

## Capacidades

- No se declara ninguna capacidad evaluada ni verificada para este adaptador.
- El modelo base (Qwen2.5-Coder-3B-Instruct) es un modelo de generación de texto orientado a código, pero las capacidades del adaptador sobre él no están documentadas.
- Soporte de tool calling / function calling: no disponible (no declarado para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo se declara inglés (`en`).
- Modo thinking, visión o audio: no disponible.
- No se reclama mejora alguna sobre el modelo base.

## Casos de uso

- Investigación controlada de adaptadores LoRA: el artefacto puede cargarse sobre Qwen2.5-Coder-3B-Instruct para estudiar el efecto de un adaptador de 59 MB entrenado 200 pasos, siempre que se resuelva antes el linaje del run.
- Auditoría de trazabilidad de artefactos: los hashes SHA-256 del adaptador, la config y el estado del entrenador permiten verificar integridad de ficheros y practicar flujos de inspección reproducibles.
- Estudio de gobernanza de modelos: la model card documenta de forma explícita un caso de procedencia incompleta, útil como material docente sobre qué exige un proceso de admisión a producción.
- Evaluación de discrepancias de linaje: sirve para diseñar controles que detecten cuándo un adaptador declara un base distinto del configurado en el job de entrenamiento.
- Pruebas de carga PEFT: permite validar pipelines de carga de adaptadores con `peft` y `transformers` sobre un base de 3B en entornos de laboratorio.
- Reproducción de inspecciones: el registro de inspección legible por máquina (`evidence/artifact-inspection-057eb8fb1189-dc28db20910f.json`) puede usarse para comparar rehashes contra metadatos del Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama precisión en held-out, speedup, total de energía ni ranking de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; para el base Qwen2.5-Coder-3B-Instruct en FP16 se requieren aproximadamente 6-7 GB, y en cuantización de 4 bits en torno a 2-3 GB (estimación general para un modelo de 3B, no declarada por el autor).
- GPU recomendadas: no declaradas. Un base de 3B puede ejecutarse en GPUs de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090; no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí para el base en cuantización, pero no verificado para este adaptador.
- Opciones de despliegue: carga vía `peft` + `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| salad-measurement-honesty-r1 | Adaptador LoRA sobre Qwen2.5-Coder-3B-Instruct | ~59 MB (adaptador) | No disponible | Apache 2.0 | Candidato privado, no cualificado |
| Qwen2.5-Coder-3B-Instruct | Modelo completo | 3B | No disponible en esta ficha | Apache 2.0 | Público |
| Qwen3-1.7B | Modelo completo | 1,7B | No disponible en esta ficha | No disponible en esta ficha | Público (referenciado en el config del job) |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Procedencia incompleta: el dataset de entrenamiento y su revisión inmutable no están verificados.
- Revisión del modelo base no fijada: el adaptador puede cargarse sobre una revisión distinta de la usada en entrenamiento.
- Discrepancia de linaje: el config del job nombra Qwen3-1.7B y el adaptador nombra Qwen2.5-Coder-3B-Instruct; no debe cargarse sobre el base equivocado.
- Sin evaluación independiente: no hay precisión en held-out, speedup, energía ni benchmark.
- No cualificado para producción (`production_qualified: false`) ni elegible para publicación (`publication_eligible: false`).
- Los hashes son comprobaciones de integridad, no firmas criptográficas de ejecución; el registro de inspección está sin firmar.
- Riesgo de alucinación: no evaluado para este adaptador.
- Sesgos: no documentados.
- Idiomas: solo inglés declarado.
- Licencia Apache 2.0 declarada, pero las condiciones de uso comercial dependen de resolver la procedencia y los derechos de datos, que no están verificados.
- No debe usarse como validación médica o científica ni como evidencia de mejora sobre el base.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-measurement-honesty-r1
- Árbol de artefactos inspeccionados: https://huggingface.co/SZLHOLDINGS/salad-measurement-honesty-r1/tree/057eb8fb1189ac7ef5367c716643f5646c3b8b36/final
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Modelo referenciado en el config del job: https://huggingface.co/Qwen/Qwen3-1.7B
