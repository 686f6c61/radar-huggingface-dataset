# UNI-PIC/Retail-TW-VL-Qwen3.5-4B-Base-Preview

## Resumen

Retail-TW-VL-Qwen3.5-4B-Base-Preview es un checkpoint vision-language obtenido mediante preentrenamiento continuado (CPT) sobre Qwen/Qwen3.5-4B-Base, desarrollado por President Information Corp. (PIC, 統一資訊) y Uni-President Information Philippines Corp. (UNI-PIPC). Su objetivo es inyectar conocimiento del dominio minorista y de comercio electronico de Taiwan (chino tradicional) en un modelo multimodal, vinculando listados de productos con sus imagenes. Es relevante porque demuestra una estrategia de adaptacion de dominio vertical sobre un modelo base abierto de 4B, con licencia Apache 2.0 y publicacion de la mezcla de datos.

El modelo emplea la arquitectura hibrida Gated DeltaNet-Gated Attention de la familia Qwen3.5 y cuenta con 4.539.265.536 parametros segun los pesos en safetensors. El repositorio ocupa 10,4 GB. Se distribuye como checkpoint base: no esta ajustado por instrucciones ni alineado en seguridad, y esta pensado como punto de partida para SFT posterior en tareas de retail.

La adaptacion se realizo con el framework ms-swift sobre 4x NVIDIA H100 de 96 GB, con un total de 2.56B tokens de texto (sin contar imagenes). El modelo esta orientado a zh-TW como idioma principal, con soporte de zh-CN e ingles, y su publicacion incluye datos cuantitativos sobre la contribucion de las imagenes al modelado del dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language; transformer hibrido Gated DeltaNet-Gated Attention (familia Qwen3.5) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | chino tradicional (zh-TW, principal), chino simplificado (zh-CN), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base y conserva su arquitectura hibrida de atencion: una combinacion de Gated DeltaNet (atencion lineal con estado recurrente) y Gated Attention clasica, segun la descripcion de la model card. La modalidad de vision se hereda del modelo base y se refuerza durante el CPT mediante pares imagen-texto de productos. El entrenamiento se ejecuto con ms-swift en 4x H100 de 96 GB.

La mezcla de CPT suma 2.56B tokens de texto: 53,7% (1.38B) corresponde a listados de productos (imagen + texto), 26,3% (674,4M) a una wiki de retail de Taiwan generada sinteticamente y 20,0% (512,9M) a datos de replay para preservar capacidades generales. Los listados cubren 7,30M productos propietarios de Taiwan en 15 categorias minoristas, cada uno con su imagen. La wiki sintetica incluye marcas, fichas de colaboradores y variantes de nombres (alias, nombres en otros idiomas, transcripciones en Zhuyin y Pinyin y errores tipograficos), generadas con NVIDIA NeMo Data Designer. El replay combina Wikipedia en zh-TW, zh-CN y en, mas pares de traduccion en<->zh de WMT19. Como evidencia del anclaje visual, eliminar la imagen eleva el bits per byte en held-out de 0,364 a 0,595.

## Capacidades

- Modelado de lenguaje multimodal imagen-texto: el checkpoint acepta pares de imagen y texto (pipeline image-text-to-text) y fue entrenado para vincular imagenes de producto con sus descripciones.
- Conocimiento de dominio minorista de Taiwan: catalogo de productos, marcas, alias y variantes ortograficas en chino tradicional.
- Generacion de texto general en zh-TW, zh-CN e ingles, preservada mediante la mezcla de replay.
- Traduccion en<->zh como capacidad secundaria derivada de los datos de replay (WMT19).
- Capacidad de continuar el preentrenamiento o servir de base para SFT; no esta ajustado por instrucciones.
- Soporte de tool calling / function calling: no disponible (checkpoint base, sin ajuste de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible en este checkpoint.
- Modo thinking, audio u otras modalidades especiales: no disponible.

## Casos de uso

- Base para SFT en atencion al cliente de retail: partir de este checkpoint y ajustar con dialogos de tienda para construir un asistente que reconozca productos por imagen y responda en chino tradicional con terminologia del catalogo.
- Enriquecimiento de fichas de producto: dado un listado y su imagen, generar o completar atributos (categoria, marca, alias) aprovechando el conocimiento inyectado en el CPT sobre 7,30M productos.
- Busqueda y matching multimodal en e-commerce: usar las representaciones del modelo como base para tareas de recuperacion imagen-texto dentro de un catalogo de 15 categorias.
- Normalizacion de nombres de producto: resolver alias, transcripciones Zhuyin/Pinyin y errores tipograficos, capacidad directamente cubierta por la wiki sintetica de entrenamiento.
- Clasificacion de catalogo por categoria minorista: ajustar una cabeza de clasificacion sobre el checkpoint para etiquetar productos nuevos en las 15 categorias del dominio.
- Traduccion de contenido de producto zh-TW <-> en: apoyarse en el replay de WMT19 para localizar fichas de producto a ingles manteniendo terminologia de retail.
- Investigacion en adaptacion de dominio: servir de referencia reproducible (mezcla de datos publicada, Apache 2.0) para estudiar CPT multimodal con datos propietarios y replay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de evaluacion es el bits per byte en held-out del dominio: 0,364 con imagen y 0,595 sin imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud para 4,54B parametros, en bf16/fp16 los pesos ocupan aproximadamente 9 GB; en cuantizacion de 8 bits, unos 4,5 GB; en 4 bits, unos 2,3 GB. El consumo real depende tambien del codificador visual y de la longitud de contexto, ambos no documentados.
- GPU recomendadas: el entrenamiento se realizo en 4x NVIDIA H100 de 96 GB; para inferencia basta una GPU con memoria suficiente para el checkpoint en la precision elegida.
- GPU de consumo: previsiblemente cabe en tarjetas consumer de 16-24 GB (RTX 4090, RTX 4080) en bf16, y en tarjetas de 8 GB con cuantizacion, aunque no hay validacion publicada.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura hibrida en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Notas |
|---|---|---|---|---|---|
| Retail-TW-VL-Qwen3.5-4B-Base-Preview | 4,54B | no disponible | Retail Taiwan (zh-TW) multimodal | Apache 2.0 | CPT sobre Qwen3.5-4B-Base, checkpoint base |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible | General multimodal | no disponible en la informacion | Modelo base del que deriva |
| Alternativas de VL de ~4B para retail | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Es un checkpoint base: no esta ajustado por instrucciones ni alineado en seguridad; no debe usarse directamente como asistente conversacional sin SFT y evaluacion.
- Riesgo de alucinacion en atributos de producto, precios o disponibilidad; el CPT no garantiza veracidad factual sobre el catalogo.
- Sesgo de dominio y geografia: el entrenamiento se centra en retail de Taiwan; el rendimiento fuera de ese mercado o en otras variedades de chino puede degradarse.
- Cobertura idiomatica limitada a zh-TW, zh-CN e ingles; sin datos sobre otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar casos de contexto largo con garantias.
- Parte de los datos de entrenamiento son propietarios (7,30M listados) y sinteticos (wiki generada con NeMo Data Designer), lo que limita la reproducibilidad y puede introducir artefactos del generador.
- No se publican benchmarks estandar (MMLU, HumanEval, GSM8K) ni evaluaciones de sesgo; la validacion en produccion requiere evaluacion propia.
- La licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento propietarios debe revisarse antes de redistribuir derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UNI-PIC/Retail-TW-VL-Qwen3.5-4B-Base-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Organizacion en Hugging Face: https://huggingface.co/UNI-PIC
- Web corporativa PIC: https://www.pic.net.tw/
- Web UNI-PIPC: https://www.pic.net.ph/
- Chat LumineOne AI: https://lumineai.pic.net.tw/
- GitHub del equipo de IA de PIC: https://github.com/pic-ai-team
- LinkedIn PIC: https://www.linkedin.com/company/president-information-corporation/
- LinkedIn UNI-PIPC: https://www.linkedin.com/company/uni-pipc/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset WMT19: https://huggingface.co/datasets/wmt/wmt19
