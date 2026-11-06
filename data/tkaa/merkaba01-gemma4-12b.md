# Tkaa/Merkaba01-Gemma4-12B

## Resumen

Merkaba01-Gemma4-12B es un paquete de pesos pre-empaquetados publicado por el usuario Tkaa para el motor de inferencia Merkaba01, un runtime cognitivo escrito en Rust. No se trata de un modelo entrenado desde cero, sino de una redistribucion de los pesos de Gemma 4 12B de Google reempaquetados en formatos binarios propietarios (`.qcore`, `.merkaba`, `.mbin`) y cuantizados de forma mixta: un nucleo `HybridQ8Q4` con `Anchor-DoRA` y un paquete ternario de 1.58 bits con `Skeleton-DoRA` para las capas MLP.

El repositorio declara 1.007.403.456 parametros en el safetensors incluido, un dato que no concuerda con la denominacion "12B" del nombre del modelo ni con el tamano del repo (9,6 GB). El safetensors presente (`model.safetensors`, 1,88 GiB) corresponde, segun la model card, a los embeddings del vocabulario base del runtime, no a los pesos completos del transformer. Esto sugiere que el contenido real del repositorio son artefactos parciales del runtime y no un checkpoint completo cargable.

La relevancia de esta publicacion es limitada y muy especifica: solo es util para quien utilice el motor Merkaba01 en Rust. Los ficheros no se pueden cargar en `transformers`, `vLLM` ni `llama.cpp`, lo que restringe drasticamente su aplicabilidad. La licencia declarada es Apache 2.0, heredada de Gemma 4 12B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B), reempaquetado para el runtime Merkaba01; no se detalla la arquitectura interna en la model card |
| Parametros totales | 1.007.403.456 (segun safetensors del repo); el nombre indica 12B, discrepancia no aclarada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HybridQ8Q4 (Q8 + Q4_G32 + Anchor-DoRA) y ternaria de 1.58 bits (Skeleton-DoRA) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.qcore`, `.merkaba`, `.mbin`, `safetensors` (embeddings y normas) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base mas alla de identificarlo como Gemma 4 12B. El empaquetado de Merkaba01 aplica una cuantizacion mixta en dos capas: un nucleo `HybridQ8Q4` que combina precision de 8 bits con bloques de 4 bits en grupos de 32 (`Q4_G32`) y un mecanismo `Anchor-DoRA`, junto con un paquete ternario de 1.58 bits para las capas MLP basado en `SharedAnchorsSvd` y `Skeleton-DoRA`. El fichero `.qcore` ocupa 6,80 GiB y el `.merkaba` 222,9 MiB.

No se proporciona informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de alineacion (RLHF, DPO). Tampoco se documentan innovaciones de decodificacion o atencion. El unico detalle tecnico relevante es el uso de `mmap` de copia cero para el nucleo cuantizado, orientado a reducir la huella de memoria en el runtime Rust.

## Capacidades

- Generacion de texto y razonamiento heredados de Gemma 4 12B, sujetos a la fidelidad de la cuantizacion aplicada (no verificada en la model card).
- Codigo y matematicas: capacidades presumibles del modelo base, sin datos de validacion publicados.
- Tool calling y function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas no esta disponible.
- Capacidades especiales (vision, audio, modo thinking): no documentadas.
- Integracion exclusiva con el motor Merkaba01 Pure-Rust; no compatible con otros runtimes.

## Casos de uso

- Despliegue en el runtime Merkaba01: unico escenario soportado; el paquete esta disenado para cargarse con `mmap` de copia cero en el motor Rust, lo que permite arrancar el modelo con una huella de memoria reducida respecto a un checkpoint completo en FP16.
- Experimentacion con cuantizacion ternaria: investigadores interesados en evaluar el esquema `Skeleton-DoRA` de 1.58 bits sobre capas MLP pueden usar el fichero `.merkaba` como referencia de implementacion.
- Entornos con memoria limitada: el nucleo `HybridQ8Q4` de 6,80 GiB permite ejecutar un modelo de la familia Gemma 4 en maquinas con menos VRAM que la requerida por el checkpoint original, siempre que se use Merkaba01.
- Desarrollo de tooling en Rust para IA local: el paquete sirve como caso de prueba para integraciones del runtime Merkaba01 en aplicaciones de escritorio o embebidas.
- Auditoria de formatos binarios propietarios: util para quien necesite analizar los contenedores `.qcore` y `.mbin` y su tokenizer binario precompilado.
- Reproduccion de pipelines de reempaquetado: como ejemplo de conversion de pesos de un modelo abierto a un formato de runtime alternativo con cuantizacion mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el nucleo cuantizado `.qcore` ocupa 6,80 GiB y el paquete ternario 222,9 MiB; el safetensors de embeddings anade 1,88 GiB. La huella total en disco es de aproximadamente 9,6 GB, pero la VRAM necesaria en ejecucion no esta documentada.
- GPU recomendadas: no disponible; la model card no especifica hardware objetivo.
- GPU de consumo: no confirmado. Por tamano de artefactos, cabria esperar funcionamiento en GPUs con 12-16 GB de VRAM, pero no hay validacion publicada.
- Opciones de despliegue: exclusivamente el motor Merkaba01 Pure-Rust. No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Runtime |
|---|---|---|---|---|---|
| Merkaba01-Gemma4-12B | 1.007.403.456 declarados (nombre indica 12B) | no disponible | Apache 2.0 | `.qcore`, `.merkaba`, `.mbin`, safetensors | Solo Merkaba01 (Rust) |
| Gemma 4 12B (Google) | 12B (segun denominacion) | no disponible en esta ficha | Gemma license / Apache 2.0 segun variante | safetensors, GGUF | transformers, vLLM, llama.cpp |
| Modelos de ~12B en formato GGUF | ~12B | variable | variable | GGUF | llama.cpp, Ollama |

La comparativa directa con alternativas de la misma categoria no es posible con rigor: no hay datos de rendimiento, contexto ni idiomas de Merkaba01-Gemma4-12B, y su formato propietario impide la ejecucion en los runtimes habituales.

## Limitaciones y advertencias

- Incompatibilidad total con el ecosistema estandar: los ficheros no se cargan en `transformers`, `vLLM` ni `llama.cpp`; solo funcionan con el runtime Merkaba01.
- Discrepancia de parametros: el safetensors declara 1.007.403.456 parametros frente a los 12B del nombre; el repositorio podria no contener el checkpoint completo del transformer.
- Estado alpha (v0.1): el autor etiqueta el paquete como version alpha, sin garantias de estabilidad ni soporte.
- Sin datos de evaluacion: no hay benchmarks, ni informacion sobre degradacion por cuantizacion ternaria de 1.58 bits en las capas MLP.
- Idiomas y contexto no documentados: imposible planificar su uso en produccion multilingue o con ventanas largas.
- Riesgo de alucinacion: inherente al modelo base, no cuantificado en esta distribucion.
- Sesgos: no documentados; se heredan los del modelo Gemma 4 subyacente.
- Licencia: Apache 2.0 declarada, pero la model card indica que los pesos derivan de Gemma 4 12B; conviene verificar los terminos de la licencia original de Gemma antes de un uso comercial.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Tkaa/Merkaba01-Gemma4-12B
- Repositorio del runtime Merkaba01: no disponible en la informacion proporcionada
- Paper o documentacion tecnica del esquema Skeleton-DoRA: no disponible
- Modelo base Gemma 4 12B de Google: no disponible en la informacion proporcionada
