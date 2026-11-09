# theConstructor/karaoke-assets

## Resumen

`theConstructor/karaoke-assets` no es un modelo de IA propiamente dicho, sino un repositorio de activos de ejecución (runtime assets) para una aplicación personal de karaoke que corre en el navegador. El autor, `theConstructor`, aloja aquí los binarios que su aplicación descarga en tiempo de ejecución, verifica contra un hash SHA-256 fijado y ejecuta localmente mediante ONNX Runtime Web. El repositorio tiene 0,4 GB y fue creado el 9 de noviembre de 2026.

El contenido principal son tres artefactos ONNX: un separador de voces derivado de UVR MDX-Net Voc_FT (en versiones fp16 y fp32), un estimador de tono FCPE exportado a ONNX, y el binario WASM de ONNX Runtime Web 1.31.1. Se incluyen además dos herramientas de CI (binaryen y Tailwind CSS CLI) como espejo de sus releases oficiales.

La relevancia de esta ficha es limitada desde el punto de vista de evaluación de modelos: el autor indica explícitamente que los archivos "no son para entrenamiento" ni constituyen una release de modelo. Resulta útil, sin embargo, como referencia de cómo se empaquetan y sirven artefactos ONNX para inferencia en navegador, y como ejemplo de las advertencias de licencia que aparecen al redistribuir pesos de UVR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contenedor de activos: separador vocal MDX-Net (ONNX) + estimador de tono FCPE (ONNX) + binario WASM de ONNX Runtime Web |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | fp16 y fp32 en los ONNX de separacion vocal; FCPE en formato ONNX sin detalle de precision |
| Idiomas soportados | no aplica (procesamiento de audio, no texto) |
| Licencia | no disponible a nivel de repo; componentes individuales: onnxruntime-web MIT, FCPE MIT, binaryen Apache-2.0, tailwindcss MIT; pesos MDX-Net Voc_FT con terminos de redistribucion **no verificados** |
| Formato de pesos | ONNX (`.onnx`), WASM (`.wasm`), tarball y binario ELF para herramientas de CI |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Agrupa artefactos de inferencia para una app de karaoke en navegador. El separador vocal es un MDX-Net Voc_FT de UVR (Ultimate Vocal Remover), derivado de la release `all_public_uvr_models` de `TRvlvr/model_repo`. La versión fp16 tiene los pares Conv+BatchNorm plegados y usa pesos y cómputo en fp16 con E/S en fp32; la versión fp32 aplica el mismo plegado Conv+BatchNorm mediante ONNX Runtime. El estimador de tono es FCPE (torchfcpe, MIT), exportado a ONNX por Scicom-intl.

El runtime es ONNX Runtime Web 1.31.1, en su variante WASM SIMD multihilo con asyncify, lo que permite ejecutar la inferencia en el hilo principal del navegador sin bloquear la UI. Las herramientas de CI (binaryen `wasm-opt` y Tailwind CSS CLI) se incluyen como espejo byte a byte de sus releases oficiales, solo como respaldo cuando fallan las descargas desde GitHub.

## Capacidades

- Separacion de voces e instrumental a partir de una mezcla musical, mediante MDX-Net Voc_FT.
- Estimacion de tono (pitch tracking) sobre señal de audio, mediante FCPE, útil para puntuar karaoke o afinar.
- Ejecucion local en navegador con ONNX Runtime Web (WASM SIMD + multihilo + asyncify), sin backend servidor.
- Verificacion de integridad de cada activo contra un SHA-256 fijado antes de ejecutarlo.
- No ofrece generacion de texto, razonamiento, codigo, vision ni tool calling.
- No es un modelo multilingue ni un modelo de lenguaje.

## Casos de uso

- Karaoke en navegador con separacion de voces en cliente: la app descarga `mdx_voc_ft_fp16.onnx` y genera la pista instrumental localmente, sin enviar el audio a un servidor.
- Puntuacion de afinacion en tiempo real: FCPE estima el tono de la voz del usuario y se compara con la melodia de referencia para calcular una puntuacion.
- Prototipos de separacion de fuentes en web: sirve como referencia de empaquetado de un separador MDX-Net en ONNX ejecutable con ONNX Runtime Web.
- Aplicaciones de audio offline-first: el patrón de verificación SHA-256 y ejecución WASM es reutilizable para cualquier pipeline de audio en el navegador.
- Referencia de licencias para redistribucion de pesos UVR: el repo documenta explícitamente que la release de origen no incluye fichero de licencia, lo que sirve de aviso para otros proyectos.
- Base para un editor de audio web con eliminación de voz: el par fp16/fp32 permite elegir entre menor uso de memoria o mayor fidelidad numérica según el dispositivo.
- Integración en CI de una web app: los espejos de binaryen y Tailwind permiten builds reproducibles cuando GitHub releases no están disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser inferencia en navegador, los requisitos dependen del runtime WASM de ONNX Runtime Web, no de VRAM de GPU dedicada.
- Memoria: el repo pesa 0,4 GB; la variante fp16 reduce el uso de memoria frente a fp32 durante la separacion vocal.
- Ejecución en CPU del cliente mediante WASM SIMD multihilo; no se documenta aceleración WebGPU ni WebGL.
- No se especifican GPU recomendadas, latencia ni throughput.
- Despliegue: cualquier navegador moderno con soporte de WASM SIMD y SharedArrayBuffer (requiere cabeceras COOP/COEP para multihilo).
- No aplica vLLM, llama.cpp, Ollama ni TGI: no es un modelo de lenguaje.

## Comparativa con modelos similares

| Aspecto | karaoke-assets (este repo) | UVR MDX-Net Voc_FT (origen) | FCPE (torchfcpe) |
|---|---|---|---|
| Tipo | Contenedor de activos ONNX/WASM | Modelo de separacion vocal | Estimador de tono |
| Formato | ONNX fp16/fp32 | Pesos originales UVR | PyTorch / ONNX |
| Licencia | No disponible a nivel de repo; pesos UVR sin verificar | Sin fichero de licencia en la release | MIT |
| Ejecucion en navegador | Si (ONNX Runtime Web) | No nativa | Via export ONNX |
| Contexto / idiomas | No aplica | No aplica | No aplica |

## Limitaciones y advertencias

- No es un modelo de IA ni un dataset: el autor indica explícitamente que los archivos no son para entrenamiento.
- Los pesos MDX-Net Voc_FT derivan de una release de UVR sin fichero de licencia, por lo que los términos de redistribución están sin verificar; riesgo legal para uso comercial.
- El repositorio no declara licencia propia, idiomas ni pipeline.
- La inferencia en navegador depende de WASM SIMD y SharedArrayBuffer; en navegadores o contextos sin estas capacidades el multihilo no funcionará.
- No hay datos de precisión, latencia ni calidad de separación publicados en la información disponible.
- Las herramientas de CI incluidas (binaryen, Tailwind) son espejos de terceros y deben actualizarse desde sus fuentes oficiales.
- El autor ofrece retirar archivos a petición de titulares de derechos, lo que indica que la situación legal de algunos activos no está resuelta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/theConstructor/karaoke-assets
- UVR (Ultimate Vocal Remover GUI): https://github.com/Anjok07/ultimatevocalremovergui
- Release de pesos UVR `all_public_uvr_models`: https://github.com/TRvlvr/model_repo
- FCPE (torchfcpe): https://github.com/CNChTu/torchfcpe
- Export ONNX de FCPE: https://huggingface.co/Scicom-intl/fcpe-onnx
- ONNX Runtime Web: https://github.com/microsoft/onnxruntime
- binaryen: https://github.com/WebAssembly/binaryen
- Tailwind CSS: https://github.com/tailwindlabs/tailwindcss
