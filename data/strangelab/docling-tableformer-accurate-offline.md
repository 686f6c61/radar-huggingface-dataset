# strangelab/docling-tableformer-accurate-offline

## Resumen

`strangelab/docling-tableformer-accurate-offline` es un paquete de artefactos de inferencia para Docling, la herramienta de conversion de documentos de IBM Research, empaquetado por el usuario strangelab. No se trata de un modelo de lenguaje generativo, sino de un bundle que reune los pesos del detector de layout Heron y del modelo TableFormer V1 Accurate, empleados por el pipeline de Docling para reconocer la estructura de tablas en PDFs con texto embebido. El paquete esta pensado para su uso sin conexion a red.

Su relevancia reside en la reduccion del tamano de descarga y en la reproducibilidad offline: el arbol de artefactos ocupa 384,43 MB frente a los 530,00 MB que descarga la cache estandar de Hugging Face para el mismo pipeline. El autor verifica la equivalencia funcional comparando la salida (Markdown y celdas de tabla) de ambos conjuntos de pesos en 30 paginas completas de tres memorias anuales, con la red deshabilitada.

El modelo se publica bajo un pipeline `image-to-text` y se integra en Docling 2.154.0 mediante el parametro `--artifacts-path`. Los ficheros de checkpoint y configuracion son identicos byte a byte a los publicados por IBM Research para Docling, de modo que este repositorio actua como espejo empaquetado y no como un modelo reentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de layout Heron + TableFormer V1 Accurate (vision por computador para estructura de documentos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | CDLA Permissive 2.0 (TableFormer) y Apache 2.0 (Heron) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El bundle agrupa dos componentes de vision entrenados por IBM Research para Docling. El primero es Heron, un detector de layout que localiza regiones estructurales en la pagina (texto, tablas, figuras). El segundo es TableFormer V1 Accurate, un modelo especializado en reconocimiento de estructura de tablas que reconstruye la rejilla de filas y columnas y asigna celdas a partir de la imagen de la tabla. Ambos operan sobre el texto nativo embebido en el PDF, sin necesidad de OCR.

Este repositorio no aporta entrenamiento propio: segun la model card, los ficheros de checkpoint y configuracion son identicos byte a byte a los publicados por IBM Research en `docling-project/docling-layout-heron` y `docling-project/docling-models`. El trabajo del autor consiste en empaquetar los artefactos, documentar las revisiones y hashes de origen en `config.json` y verificar la equivalencia de salida frente a la cache estandar. No se dispone de informacion sobre el numero de tokens, la composicion del dataset ni el proceso de alineacion empleado en el entrenamiento original.

## Capacidades

- Deteccion de layout de pagina en PDFs con texto embebido (regiones de texto, tablas y figuras) mediante Heron.
- Reconocimiento de estructura de tablas en modo Accurate: reconstruccion de filas, columnas y celdas mediante TableFormer V1.
- Conversion de PDF a Markdown y a JSON a traves del pipeline de Docling.
- Funcionamiento completamente offline una vez descargados los artefactos, con acceso a red deshabilitado.
- Uso con texto nativo del PDF; el OCR de paginas escaneadas queda fuera de este bundle y requiere el setup estandar de Docling.
- No soporta generacion de texto, razonamiento, codigo, tool calling ni capacidades de agente: es un componente de vision para documentos.

## Casos de uso

- Extraccion de tablas de memorias anuales y estados financieros: el modo Accurate reconstruye la rejilla de celdas de tablas densas en informes corporativos, escenario validado por el autor sobre 18 paginas con tablas marcadas de tres memorias anuales.
- Digitalizacion de documentacion tecnica en entornos air-gapped: al funcionar sin red con `--artifacts-path`, encaja en pipelines de conversion ejecutados en servidores sin salida a Internet.
- Construccion de pipelines RAG sobre PDFs: la salida a Markdown y JSON con tablas estructuradas alimenta indices de recuperacion que necesitan preservar la relacion fila-columna.
- Reproducibilidad de conversiones en CI/CD: al fijar revisiones y hashes en `config.json`, permite conversiones deterministas y auditables en pipelines automatizados.
- Procesamiento por lotes de informes regulatorios: la reduccion de 530,00 MB a 384,43 MB en artefactos disminuye el coste de aprovisionamiento en contenedores e imagenes de despliegue.
- Validacion cruzada de calidad de extraccion: util para comparar la salida del bundle con la cache estandar de Hugging Face y detectar desviaciones en la conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta una prueba de equivalencia funcional: en Docling 2.154.0 sobre CPU Apple M4, el arbol de artefactos de este repositorio y la cache estandar produjeron Markdown y celdas de tabla identicos en 30 paginas completas (18 con tablas marcadas y 12 de prosa de control) de tres memorias anuales, con acceso a red deshabilitado en ambas conversiones.

## Requisitos de hardware

- Almacenamiento: 384,43 MB para el arbol de artefactos (frente a 530,00 MB de la cache estandar).
- VRAM: no disponible; la unica medicion publicada se realizo en CPU (Apple M4).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: Docling 2.154.0 con `--artifacts-path` apuntando al directorio descargado; descarga previa mediante `hf download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano de artefactos | Licencia | Disponibilidad |
|---|---|---|---|---|
| strangelab/docling-tableformer-accurate-offline | Bundle Heron + TableFormer V1 Accurate | 384,43 MB | CDLA Permissive 2.0 + Apache 2.0 | Hugging Face |
| docling-project/docling-models (TableFormer V1 Accurate) | Modelo original de IBM Research | no disponible | CDLA Permissive 2.0 | Hugging Face |
| docling-project/docling-layout-heron | Detector de layout original de IBM Research | no disponible | Apache 2.0 | Hugging Face |

La diferencia principal frente a los originales es el empaquetado conjunto para uso offline y la reduccion de tamano; los pesos son identicos byte a byte. No se dispone de datos de rendimiento comparativo con otras herramientas de reconocimiento de tablas.

## Limitaciones y advertencias

- Solo procesa PDFs con texto embebido; las paginas escaneadas requieren el setup de OCR estandar de Docling, no incluido en este bundle.
- El modo Fast de tablas no esta cubierto por este paquete.
- No es un modelo generativo: no admite prompts, razonamiento ni tool calling.
- La equivalencia con la cache estandar solo se verifico en Docling 2.154.0 sobre CPU Apple M4 y un panel limitado de 30 paginas; no hay garantia formal de identidad en otras versiones o plataformas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- Licencias duales: debe respetarse CDLA Permissive 2.0 para TableFormer y Apache 2.0 para Heron; conviene revisar ambas antes de uso comercial.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni limitaciones idiomaticas del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/strangelab/docling-tableformer-accurate-offline
- Documentacion de uso offline de Docling: https://docling-project.github.io/docling/usage/advanced_options/#model-prefetching-and-offline-usage
- Heron layout model (Apache 2.0): https://huggingface.co/docling-project/docling-layout-heron/tree/8f39ad3c0b4c58e9c2d2c84a38465abf757272d8
- TableFormer V1 Accurate (CDLA Permissive 2.0): https://huggingface.co/docling-project/docling-models/tree/fc0f2d45e2218ea24bce5045f58a389aed16dc23/model_artifacts/tableformer/accurate
