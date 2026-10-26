# Strongich/nla-qwen3-1.7b-L20-av

# Ficha: Strongich/nla-qwen3-1.7b-L20-av

## Resumen

`Strongich/nla-qwen3-1.7b-L20-av` es el componente *Activation Verbalizer* (AV) de un autoencoder en lenguaje natural (*Natural Language Autoencoder*, NLA) construido sobre `Qwen/Qwen3-1.7B`. Su funcion no es conversar ni generar texto de proposito general: recibe las activaciones del *residual stream* a la salida de la capa 20 del modelo base y las traduce a lenguaje natural, es decir, produce una descripcion textual legible de lo que el modelo esta representando internamente en ese punto de la red. El autor es `Strongich`, y el checkpoint se publica junto a un reconstructor emparejado (`nla-qwen3-1.7b-L20-ar`) que realiza el camino inverso: a partir del texto verbalizado, reconstruye la activacion original.

El modelo es relevante por su enfoque: en lugar de describir activaciones mediante diccionarios aprendidos (autoencoders dispersos, transcoders), utiliza un par verbalizador-reconstructor entrenado con RL conjunto para que el texto generado sea suficiente para recuperar la activacion. Esto convierte la representacion interna en un objeto inspeccionable y auditable por humanos, lo que resulta util para investigacion en interpretabilidad mecanicista, analisis de fallos y monitorizacion de representaciones.

Tecnicamente es un transformer decoder-only denso de 1.720.574.976 parametros, con pesos en safetensors y compatibilidad con `transformers` y `text-generation-inference`. El checkpoint corresponde a una epoca completa de entrenamiento RL conjunto. No hay resultados de evaluacion, benchmarks, licencia declarada ni metricas de fidelidad de reconstruccion publicadas en la informacion disponible, y el repositorio registra 0 descargas, por lo que debe tratarse como un artefacto de investigacion incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) adaptado como *Activation Verbalizer* de un autoencoder en lenguaje natural |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible para el AV; heredada de Qwen3-1.7B (32 768 tokens nativos segun la documentacion publica del modelo base, no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el repositorio publica unicamente pesos en safetensors, sin GGUF ni cuantizaciones oficiales |
| Idiomas soportados | no disponibles (el modelo base Qwen3-1.7B es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Capa leida | salida de la capa 20 del *residual stream* de Qwen3-1.7B |
| Modelo base | `Qwen/Qwen3-1.7B` |
| Componente emparejado | `Strongich/nla-qwen3-1.7b-L20-ar` (reconstructor de activaciones) |
| Entrenamiento reportado | RL conjunto, 1 epoca completa |
| Tamano del repositorio | 3,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-26 |
| Etiquetas | transformers, safetensors, qwen3, text-generation, natural-language-autoencoder, nla, interpretability, conversational, base_model:finetune:Qwen/Qwen3-1.7B, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El artefacto forma parte de un NLA, un esquema de interpretabilidad en el que dos modelos se entrenan de forma acoplada: el *Activation Verbalizer* (este checkpoint) convierte un vector de activacion en una descripcion en lenguaje natural, y el *Activation Reconstructor* (`nla-qwen3-1.7b-L20-ar`) toma esa descripcion y regenera el vector. El objetivo implicito es que el texto verbalizado contenga suficiente informacion como para reconstruir la activacion, de modo que la descripcion sea un proxy fiel de la representacion interna. La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only denso, reutilizado como cabezal de verbalizacion tras el ajuste.

Segun la model card, el checkpoint corresponde al AV del par que lee el *residual stream* a la salida de la capa 20, tras **una epoca completa de entrenamiento RL conjunto** con el reconstructor. La informacion disponible no detalla la funcion de recompensa, el volumen de datos de entrenamiento, la composicion del corpus, ni si hubo fases previas de ajuste supervisado antes del RL; la receta original se atribuye al repositorio `kitft/natural_language_autoencoders` y el codigo y articulo del autor se enlazan en `Strongich/doomloop-interp`. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento especificos para esta adaptacion.

## Capacidades

- Verbalizacion de activaciones: dada una activacion del *residual stream* de la capa 20 de Qwen3-1.7B, genera una descripcion en lenguaje natural de su contenido.
- Reconstruccion en circuito cerrado: junto con el checkpoint `-ar`, permite medir la fidelidad del texto verbalizado reconstruyendo el vector original.
- Inspeccion de representaciones internas: util para comprobar si una hipotesis sobre lo que el modelo "esta pensando" en esa capa se refleja en la verbalizacion.
- Integracion con el ecosistema Hugging Face: pesos en safetensors, libreria `transformers`, etiqueta `text-generation-inference` y `endpoints_compatible`.
- Etiqueta `conversational`: el repositorio la incluye, pero no hay evidencia en la informacion disponible de que el modelo funcione como asistente conversacional de proposito general.
- Capacidades multilingues del modelo base: Qwen3-1.7B es multilingue segun su documentacion, pero no se especifica si las verbalizaciones del AV conservan ese multilingueismo.
- No documentado: soporte de *tool calling*, function calling, razonamiento multi-paso, modo *thinking*, vision o audio para esta adaptacion concreta.

## Casos de uso

- **Investigacion en interpretabilidad mecanicista**: enganchar el AV a las activaciones de la capa 20 de Qwen3-1.7B durante una inferencia y obtener descripciones textuales de conceptos intermedios, utiles para formular y contrastar hipotesis sobre circuitos internos.
- **Construccion de corpus de descripciones de activaciones**: generar pares (activacion, descripcion) sobre grandes lotes de prompts para entrenar sondas lineales, clasificadores de conceptos o diccionarios de caracteristicas supervisados por texto.
- **Auditoria de seguridad de representaciones**: verbalizar activaciones en prompts sensibles y revisar si el texto describe contenido que el modelo no exterioriza en su salida visible, como apoyo a analisis de comportamiento no declarado.
- **Diagnostico de alucinaciones y fallos**: localizar el punto de la generacion en el que la representacion de la capa 20 se desvia y describir ese estado en lenguaje natural, lo que facilita el analisis de causa raiz en pipelines de evaluacion.
- **Monitorizacion experimental en produccion**: usar el par AV/AR para calcular una senal de fidelidad de reconstruccion por peticion y detectar entradas anomalas o fuera de distribucion, siempre con caracter de prototipo de investigacion.
- **Comparacion de representaciones entre prompts e idiomas**: verbalizar la misma idea formulada en distintos idiomas o registros y comparar las descripciones resultantes para estudiar invariancia y sesgos de representacion.
- **Apoyo al desarrollo de tecnicas de *steering***: las descripciones del AV sirven como guia cualitativa para construir y validar vectores de direccion o ediciones de activaciones en experimentos controlados.
- **Docencia y divulgacion tecnica**: demostrar de forma tangible que la informacion del *residual stream* es parcialmente verbalizable, con un coste de computo reducido gracias al tamano de 1,7 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

En concreto, no hay datos de MMLU, HumanEval, GSM8K ni de metricas propias de un NLA como la similitud coseno entre activacion original y reconstruida, la perplejidad del reconstructor condicionada al texto, ni tasas de exito de reconstruccion. Tampoco se han publicado comparaciones con autoencoders dispersos o transcoders entrenados sobre la misma capa.

## Requisitos de hardware

- **VRAM estimada (inferencia)**: en bf16/fp16, aproximadamente 3,4 GB solo de pesos, mas 4-6 GB en total contando overhead del runtime y activaciones para contextos moderados.
- **Cuantizacion**: no hay versiones cuantizadas publicadas; conversiones propias a int8 (unos 1,7 GB) o int4 (unos 0,9 GB) son viables, pero degradarian la senal que el AV debe describir y deben validarse contra el reconstructor antes de usarse.
- **GPU consumer**: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090. En GPUs de 8 GB es posible en bf16 con contexto corto, pero el margen es ajustado si se ejecuta simultaneamente el modelo base Qwen3-1.7B y el reconstructor.
- **GPU profesional**: A10G 24 GB, L4 24 GB, A100 40/80 GB y H100 sin problemas; el cuello de botella no es el AV sino mantener cargados el modelo base y el reconstructor en el mismo dispositivo.
- **Despliegue**: `transformers` como via principal; `text-generation-inference` esta etiquetado en el repositorio y `endpoints_compatible` sugiere despliegue en Inference Endpoints. vLLM es previsiblemente compatible al compartir arquitectura Qwen3, pero no esta confirmado. GGUF/Ollama/llama.cpp no estan disponibles al no publicarse pesos cuantizados.
- **Latencia y throughput**: no disponible; no hay mediciones publicadas. Como referencia de orden de magnitud, un modelo denso de 1,7 B en bf16 decodifica con holgura en GPUs consumer, pero el coste real del flujo NLA incluye ejecutar tambien el modelo base y el reconstructor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Strongich/nla-qwen3-1.7b-L20-av` (este) | 1,72 B | no disponible (heredado del base) | Verbalizador de activaciones (capa 20) | no disponible | 0 descargas, 0 likes |
| `Strongich/nla-qwen3-1.7b-L20-ar` | no disponible en la informacion | no disponible | Reconstructor de activaciones desde texto | no disponible | pareja del AV |
| `Qwen/Qwen3-1.7B` (base) | 1,72 B | 32 768 tokens nativos segun documentacion publica de Qwen3 | Generacion de texto, razonamiento hibrido, codigo, matematicas, multilingue | Apache 2.0 segun fuentes publicas de Qwen3 | Ampliamente distribuido |
| Autoencoders dispersos (SAE) y transcoders de la literatura | variable segun capa y expansion | no aplica | Descripcion/descomposicion de activaciones | variable | Requieren entrenamiento propio por capa |

La comparacion directa con SAE o transcoders no puede cuantificarse aqui: no hay metricas publicadas del NLA que permitan contrastar fidelidad de reconstruccion, interpretabilidad o coste de entrenamiento frente a esas alternativas. La ventaja conceptual del NLA es que su salida es lenguaje natural legible sin postproceso; la desventaja, la ausencia de evaluacion publica.

## Limitaciones y advertencias

- **No es un modelo de proposito general**: pese a la etiqueta `conversational`, es un artefacto de interpretabilidad; usarlo como asistente producira resultados no representativos.
- **Dependencia estricta del modelo base y de la capa**: solo tiene sentido sobre activaciones de la capa 20 de `Qwen/Qwen3-1.7B`. No es transferible a otras capas, otros tamanos de Qwen3 ni otras familias sin reentrenar.
- **Requiere el reconstructor para validarse**: el AV aislado no permite medir fidelidad; sin `nla-qwen3-1.7b-L20-ar` no hay forma de saber si la verbalizacion describe realmente la activacion o produce una narracion plausible pero desconectada.
- **Riesgo de verbalizaciones no fieles**: un modelo de lenguaje que describe vectores puede generar texto coherente que no corresponda al contenido real de la representacion; no hay tasas de fidelidad publicadas que acoten este riesgo.
- **Entrenamiento minimo**: una sola epoca de RL conjunto y ausencia de evaluacion sugieren un checkpoint preliminar, no un instrumento calibrado.
- **Licencia no declarada**: al no especificarse licencia, el uso comercial y la redistribucion son inciertos y suponen un riesgo legal; debe consultarse al autor antes de cualquier despliegue.
- **Idiomas no declarados**: se desconoce en que idioma verbaliza y si conserva el multilingueismo del base; es probable que el entrenamiento se haya realizado mayoritariamente en ingles, pero no esta confirmado.
- **Sesgos**: al heredar el modelo base, puede reproducir sesgos de genero, culturales o linguisticos de Qwen3-1.7B, y ademas proyectarlos en las descripciones de activaciones, lo que puede sesgar conclusiones de investigacion.
- **Sin benchmarks ni validacion externa**: 0 descargas y 0 likes implican ausencia de replicacion independiente.
- **Anomalia de metadatos**: las fechas de creacion y actualizacion (2026-10-26) son posteriores a la fecha habitual de consulta; conviene verificar la procedencia del repositorio.
- **Coste oculto del flujo completo**: un experimento real requiere cargar simultaneamente Qwen3-1.7B, el AV y el reconstructor, lo que triplica el consumo de VRAM respecto a la cifra aislada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Strongich/nla-qwen3-1.7b-L20-av
- Reconstructor emparejado: https://huggingface.co/Strongich/nla-qwen3-1.7b-L20-ar
- Codigo y articulo del autor: https://github.com/Strongich/doomloop-interp
- Receta original de NLA: https://github.com/kitft/natural_language_autoencoders
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Perfil de Qwen3-1.7B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_1_7b
