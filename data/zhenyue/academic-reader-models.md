# zhenyue/academic-reader-models

## Resumen

`zhenyue/academic-reader-models` es un repositorio de artefactos empaquetados para la aplicacion Academic Reader, no un modelo de lenguaje unico. El autor (zhenyue) publica en Hugging Face los ficheros que la app descarga en tiempo de ejecucion, cada uno verificado contra su hash SHA-256. El repositorio tiene un tamano de 0,4 GB, 38 descargas y ningun "like" en el momento de la consulta, y no declara licencia, idiomas ni pipeline a nivel de repositorio.

El contenido principal son dos modelos convertidos a Core ML: un modelo de layout D-FINE (procedente de OXR-1.0, de SoMarkAI) en precision mixta, y una conversion de `BAAI/bge-small-en-v1.5`, un modelo de embeddings de frases. Ademas, incluye 34 fuentes tipograficas (Source Han regional, LXGW WenKai, Klee One, MaruBuri, Noto y Go Noto) y, solo en ModelScope, un espejo de `SoMarkAI/OXR-1.0` en `model.safetensors` y `tokenizer.json`.

Es relevante para desarrolladores que quieran replicar el pipeline de lectura academica de la app (deteccion de layout de pagina, embeddings para busqueda semantica) sobre Apple Silicon mediante Core ML, o reutilizar las conversiones. No es un modelo generativo ni un LLM: es un paquete de dependencias de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE (deteccion de layout) y BGE-small (encoder de frases), ambos convertidos a Core ML |
| Parametros totales | no disponible (no se publican recuentos por artefacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (bge-small-en-v1.5 original: 512 tokens; no confirmado en esta conversion) |
| Tipos de cuantizacion | Core ML en precision mixta (D-FINE); cuantizacion de bge-small no especificada |
| Idiomas soportados | no disponible (bge-small-en-v1.5 es solo ingles; D-FINE es independiente del idioma) |
| Licencia | no disponible a nivel de repo; por artefacto: OXR License (Apache-2.0 con terminos adicionales de SoMark), MIT (bge-small), SIL OFL 1.1 (fuentes) |
| Formato de pesos | Core ML (`dfine-coreml/`, `bge-small-en-v1.5-coreml/`); `model.safetensors` + `tokenizer.json` solo en ModelScope |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: publica conversiones. El artefacto `dfine-coreml/` es el modelo de layout D-FINE de OXR-1.0 convertido a Core ML en precision mixta; D-FINE es un detector basado en transformers con refinamiento de distribucion (distribution refinement) para deteccion de objetos, aqui aplicado a la deteccion de regiones de layout en paginas de documentos academicos. El artefacto `bge-small-en-v1.5-coreml/` es la conversion a Core ML de `BAAI/bge-small-en-v1.5`, un encoder transformer pequeno de la familia BGE orientado a embeddings de frases en ingles.

No se documentan en la model card los datos de entrenamiento, el numero de tokens, ni si hubo RLHF/DPO o ajuste fino posterior. Tampoco se detalla la receta de conversion (opset, precisiones por capa, calibracion). El espejo `model.safetensors`/`tokenizer.json` corresponde a `SoMarkAI/OXR-1.0`, cuyo entrenamiento no se describe en la informacion disponible.

## Capacidades

- Deteccion de layout de documentos: el modelo D-FINE identifica regiones estructurales (texto, figuras, tablas, etc.) en paginas academicas, como paso previo al recorte y OCR.
- Generacion de embeddings de frases en ingles: `bge-small-en-v1.5` produce representaciones densas para busqueda semantica y similitud entre fragmentos.
- Inferencia en dispositivo en Apple Silicon via Core ML (CPU, GPU y Neural Engine segun el despliegue).
- Verificacion de integridad: cada artefacto se comprueba contra su SHA-256 en la app antes de usarse.
- Renderizado tipografico multilingue: 34 fuentes que cubren chino (Source Han regional, LXGW WenKai), japones (Klee One), coreano (MaruBuri) y latinas/Noto.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes, vision general, audio ni modo "thinking".

## Casos de uso

- Pipeline de lectura academica en macOS/iOS: usar `dfine-coreml` para segmentar la pagina en regiones y `bge-small-en-v1.5-coreml` para indexar los fragmentos extraidos; ambos artefactos estan pensados exactamente para este flujo dentro de la app.
- Busqueda semantica local de literatura: generar embeddings con la conversion de BGE-small y almacenarlos en un indice vectorial en el dispositivo, sin enviar texto a servidores externos.
- Deduplicacion y agrupacion de fragmentos: comparar embeddings de parrafos para detectar contenido repetido entre papers o notas.
- Extraccion estructurada de PDFs academicos: combinar la deteccion de layout con un OCR posterior para reconstruir secciones (abstract, cuerpo, referencias) antes de alimentar un LLM.
- Prototipado de apps de lectura en Apple Silicon: reutilizar las conversiones Core ML para evitar el paso de conversion desde PyTorch, con el ahorro de tiempo que ello implica.
- Empaquetado de fuentes para visores multilingues: reutilizar las 34 caras (SIL OFL 1.1) en visores de documentos que necesiten cobertura CJK y latina.
- Verificacion de integridad en pipelines de distribucion: adoptar el patron de hash SHA-256 para validar artefactos descargados en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no disponible; al ser Core ML, la inferencia usa memoria unificada en Apple Silicon, no VRAM dedicada. El repo completo ocupa 0,4 GB, pero el peso de cada artefacto por separado no se detalla.
- GPU recomendadas: Apple Silicon (serie M) con soporte Core ML; no se documenta compatibilidad con A100, H100 ni RTX 4090, ya que Core ML esta orientado a hardware Apple.
- Cabe en GPU de consumo: si, en equipos Apple Silicon; no se garantiza en GPU NVIDIA/AMD sin reconversion a otro runtime.
- Opciones de despliegue: Core ML (framework nativo de Apple); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zhenyue/academic-reader-models` | Paquete Core ML (D-FINE + BGE-small + fuentes) | no disponible | no disponible | por artefacto (OXR, MIT, OFL) | Hugging Face (0,4 GB) |
| `SoMarkAI/OXR-1.0` | Modelo de layout/documento (origen del D-FINE) | no disponible | no disponible | OXR License | Hugging Face / ModelScope |
| `BAAI/bge-small-en-v1.5` | Encoder de frases | no disponible | 512 tokens (original) | MIT | Hugging Face |
| D-FINE (upstream) | Detector de objetos | no disponible | no aplica | no disponible | Repo de investigacion |

La comparativa es estructural: el repositorio de zhenyue es una distribucion de artefactos derivados de los otros tres, no un competidor directo. No se dispone de datos de rendimiento para comparar metricas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; usarlo como sustituto de un LLM es un error de categoria.
- El repositorio no declara licencia, idiomas ni pipeline a nivel global; la licencia aplica por artefacto y debe revisarse individualmente (OXR License incluye terminos adicionales de SoMark sobre Apache-2.0).
- `bge-small-en-v1.5` esta entrenado solo en ingles; los embeddings para otros idiomas no son fiables.
- La deteccion de layout D-FINE puede fallar en maquetaciones atipicas (dos columnas con figuras flotantes, escaneos torcidos, tablas complejas); no se documentan tasas de error.
- Al ser conversiones Core ML, el rendimiento y la fidelidad numerica pueden diferir del modelo original en PyTorch; no se publican comparaciones.
- El espejo `model.safetensors` solo esta en ModelScope, lo que puede romper la reproducibilidad si se descarga solo desde Hugging Face.
- El numero de descargas (38) y la ausencia de "likes" indican poca validacion externa; conviene verificar los SHA-256 antes de usar en produccion.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto mas alla de las propias de cada componente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zhenyue/academic-reader-models
- Modelo de layout de origen (OXR-1.0): https://huggingface.co/SoMarkAI/OXR-1.0
- Encoder de frases original: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper de D-FINE: no disponible en la informacion proporcionada
- Repositorio de D-FINE: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
