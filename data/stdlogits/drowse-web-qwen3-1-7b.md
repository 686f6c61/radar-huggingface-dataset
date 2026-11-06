# stdlogits/drowse-web-qwen3-1.7b

## Resumen

`stdlogits/drowse-web-qwen3-1.7b` es un espejo de integridad de un paquete de artefactos para ejecutar Qwen3-1.7B en el navegador mediante el runtime `drowse`. No es un checkpoint de Transformers al uso: contiene pesos, tokenizer, runtime WebAssembly y metadatos de procedencia empaquetados para su uso con WebGPU y MLC. El autor del repositorio es `stdlogits`, y los bytes originales provienen de `puppyum/polythetic-web-qwen3-1.7b` en la revision `cda345a4200f08cca112502d99c700b04026fefe`.

El modelo subyacente es Qwen3-1.7B, un transformer denso de 1.700 millones de parametros de la familia Qwen3, pero la ficha se refiere al artefacto de navegador, no al modelo original. El repositorio ocupa 2,1 GB y esta pensado para inferencia local en el cliente sin servidor. Es relevante para quien quiera desplegar generacion de texto en el navegador con WebGPU, pero conviene subrayar que el propio autor advierte de que este espejo no certifica compatibilidad con el runtime `drowse` actual ni figura en su catalogo de instalacion firmado.

La licencia es mixta (`mixed-artifact-licenses`), con licencias por componente detalladas en `LICENSES.md`. No se declaran idiomas soportados en los metadatos del repositorio, aunque el modelo base Qwen3 es multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) empaquetado para runtime de navegador `drowse` con WebGPU/MLC |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion del repositorio |
| Tipos de cuantizacion | no disponible (artefactos de navegador; se desconoce el esquema exacto de cuantizacion) |
| Idiomas soportados | no disponible en los metadatos del repositorio |
| Licencia | mixta (`mixed-artifact-licenses`), con `LICENSES.md` por componente |
| Formato de pesos | artefactos de runtime de navegador (pesos, tokenizer y WebAssembly), no checkpoint estandar de Transformers |

## Arquitectura y entrenamiento

El artefacto empaqueta el modelo Qwen3-1.7B, un transformer denso de 1.700 millones de parametros, junto con tokenizer y runtime WebAssembly para ejecucion en navegador sobre WebGPU mediante MLC. El repositorio no aporta informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo base; esos detalles corresponden a la model card original de Qwen3, no a este espejo.

La innovacion relevante aqui no esta en el modelo sino en el empaquetado: se preservan los bytes originales y la identidad antigua `saklas-web-runtime-v1`, y se anaden documentacion y avisos de licencia. El autor indica explicitamente que este upload no es una certificacion de compatibilidad con el runtime `drowse` actual y que no esta incluido en su catalogo de instalacion firmado. La instalacion en navegador requiere un runtime compatible y un catalogo firmado; la mera disponibilidad publica de los ficheros no habilita el boton de descarga de la aplicacion.

## Capacidades

- Generacion de texto conversacional en el navegador mediante WebGPU, sin servidor.
- Inferencia local en el cliente con el runtime `drowse` (si se dispone de una version compatible).
- Capacidades heredadas del modelo base Qwen3-1.7B: generacion de texto, razonamiento y codigo, segun la model card original (no verificadas en este repositorio).
- Soporte multilingue heredado del modelo base (no declarado en los metadatos del espejo).
- Tool calling y modo thinking: no disponible en la informacion de este repositorio.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Demos de generacion de texto sin backend: el paquete permite cargar pesos y tokenizer en el navegador y generar texto en el cliente, eliminando costes de servidor en prototipos.
- Aplicaciones web con privacidad por diseno: al ejecutarse localmente en el navegador, los prompts no salen del dispositivo, lo que encaja en escenarios con datos sensibles.
- Pruebas de viabilidad de WebGPU: util para evaluar latencia y consumo de memoria de un modelo de 1.700 millones de parametros en GPUs de usuario final.
- Educacion y experimentacion: permite a desarrolladores estudiar el empaquetado de artefactos MLC y el flujo de runtime WebAssembly sin infraestructura propia.
- Herramientas de escritura offline en aplicaciones web progresivas: autocompletado o reescritura de texto con un modelo pequeno embebido.
- Investigacion sobre procedencia y verificacion de artefactos: el repositorio incluye `UPLOAD-PROVENANCE.json` con hashes y revision de origen, util como caso de estudio de cadena de suministro de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio no detalla el esquema de cuantizacion de los artefactos.
- GPU recomendadas: no disponible; al ejecutarse en navegador depende de WebGPU y del soporte del navegador y del sistema operativo.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del modelo base (1.700 millones de parametros), pero no hay datos confirmados en el repositorio.
- Opciones de despliegue: runtime `drowse` con WebGPU/MLC; no es compatible con vLLM, llama.cpp, Ollama o TGI al no ser un checkpoint estandar de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stdlogits/drowse-web-qwen3-1.7b | 1.700 M | no disponible | artefactos de navegador (WebGPU/MLC) | mixta | espejo de integridad, sin catalogo firmado |
| Qwen3-1.7B (original) | 1.700 M | no disponible en esta ficha | safetensors (Transformers) | segun model card de Qwen | disponible en Hugging Face |
| Alternativas de navegador (otros bundles MLC/WebGPU) | variable | variable | artefactos de navegador | variable | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte de que este espejo no certifica compatibilidad con el runtime `drowse` actual y no esta en el catalogo de instalacion firmado; el boton de descarga de la aplicacion no se habilita solo por la disponibilidad publica de los ficheros.
- No es un checkpoint estandar de Transformers: no puede cargarse con `transformers`, vLLM, llama.cpp, Ollama o TGI sin conversion.
- Licencia mixta por componente: es obligatorio revisar `LICENSES.md` antes de cualquier uso comercial o redistribucion.
- No se declaran idiomas soportados ni contexto maximo en los metadatos del repositorio.
- Riesgo de alucinacion y sesgos del modelo base Qwen3-1.7B: no documentados en este repositorio.
- La identidad antigua `saklas-web-runtime-v1` se preserva en los artefactos, lo que puede generar confusion sobre la version real del runtime.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stdlogits/drowse-web-qwen3-1.7b
- Origen de los artefactos: https://huggingface.co/puppyum/polythetic-web-qwen3-1.7b/tree/cda345a4200f08cca112502d99c700b04026fefe
- Licencias por componente: https://huggingface.co/logitsml/drowse-web-qwen3-1.7b/blob/main/LICENSES.md
- Procedencia y hashes: `UPLOAD-PROVENANCE.json` en el repositorio
