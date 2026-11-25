# velaresearch/vela-sd-turbo-int-v2

## Resumen

`vela-sd-turbo-int-v2` es un artefacto de pesos publicado por velaresearch que contiene una versión re-cuantizada a enteros del modelo de difusión `stabilityai/sd-turbo`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es el "consensus artifact" que los nodos de la red Vela utilizan para validar y minar bloques bajo el esquema Proof-of-Inference (payload v2). El fichero se distribuye como `sd-turbo-int.poisd`, con un hash SHA-256 fijado que los nodos comparan para rechazar cualquier variante.

El modelo subyacente es un UNet de difusión de un solo paso que genera imágenes de 512×512 píxeles, con un latente de 4×64×64 en int16 y un tokenizador CLIP BPE (vocabulario de 49406 tokens, máximo 75 tokens de prompt). El repositorio ocupa 1,2 GB y el fichero de pesos concreto pesa 1 187 585 285 bytes.

Su relevancia es acotada pero específica: cualquier operador que quiera participar en la red Vela (nodo `velad` o minero `vela-miner`) bajo payload v2 necesita exactamente este fichero, ya que la validación es determinista por hash. La licencia es "other" y remite a la de `stabilityai/sd-turbo`, de modo que los términos del modelo base se aplican a esta re-cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (UNet de un solo paso, destilado de SD) sobre espacio latente 4×64×64 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; prompt máximo de 75 tokens (tokenizador CLIP BPE, vocab 49406) |
| Tipos de cuantización | Formato entero propietario de Vela (`int`, latente int16); contenedor VIR opset-1 publicado aparte |
| Idiomas soportados | no disponible (prompts en lenguaje natural vía CLIP; sin lista oficial de idiomas) |
| Licencia | other (remite a la licencia de `stabilityai/sd-turbo`) |
| Formato de pesos | `.poisd` (1 187 585 285 bytes, SHA-256 `ba38ab96b3398e22ea631d8a457350f91833e57463199d063663308513651f36`) |
| Resolución de salida | 512×512 |
| Pasos de inferencia | 1 (one-step) |
| Repo en Hugging Face | 1,2 GB |

## Arquitectura y entrenamiento

El modelo es una re-cuantización entera de `stabilityai/sd-turbo`, un modelo de difusión latente destilado para generar imágenes en un único paso. La arquitectura subyacente es la de Stable Diffusion (UNet + autoencoder latente + codificador de texto CLIP), pero el artefacto publicado no incluye detalles sobre el proceso de destilación ni sobre los datos de entrenamiento originales; esa información corresponde al modelo base y no se reproduce en la model card.

La innovación técnica relevante aquí no está en el modelo en sí, sino en su uso como artefacto de consenso: los nodos de Vela fijan el hash del fichero y rechazan cualquier variante, de modo que la inferencia se convierte en una operación verificable y determinista entre participantes. El latente se almacena en int16 (4×64×64) y el contenedor VIR (opset-1) con los mismos pesos se publica por separado para su uso en el runtime de inferencia de la red.

## Capacidades

- Generación de imágenes de 512×512 píxeles en un solo paso de difusión.
- Aceptación de prompts de texto en lenguaje natural a través del tokenizador CLIP BPE (máximo 75 tokens).
- Validación y minado de bloques en la red Vela bajo payload v2 (Proof-of-Inference).
- Verificación determinista por hash SHA-256 del fichero de pesos.
- Compatibilidad con el nodo `velad` y el minero `vela-miner` de Vela.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multimodales de entrada más allá del texto.

## Casos de uso

- Operación de un nodo Vela: ejecutar `velad -testnet4 -poimodel=/path/sd-turbo-int.poisd` para validar y minar bloques mientras la red está en payload v2, ya que el nodo rechaza cualquier fichero cuyo hash difiera del fijado.
- Minado en testnet4: lanzar `vela-miner --chain testnet4 --model-v2 /path/sd-turbo-int.poisd` para participar en la red; un minero que además lleve `--model` sigue el cambio programado a v4 sin reiniciar.
- Verificación de integridad de artefactos: usar el SHA-256 publicado para auditar que una copia local del fichero es exactamente la esperada antes de desplegarla en producción.
- Generación de imágenes de 512×512 en pipelines ligeros: al ser un modelo de un solo paso, encaja en escenarios donde la latencia de muestreo importa más que la fidelidad máxima, siempre dentro de los términos de la licencia del modelo base.
- Despliegue del contenedor VIR: emplear la variante VIR (opset-1) de los mismos pesos, publicada por separado, para integrar la inferencia en el runtime de Vela sin depender del formato `.poisd`.
- Reproducción de consenso en pruebas: montar un entorno de test que replique la validación por hash para comprobar el comportamiento de nodos y mineros antes de un despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el fichero de pesos ocupa 1 187 585 285 bytes (aproximadamente 1,19 GB) y el latente es 4×64×64 en int16.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: nodo `velad` y minero `vela-miner` de Vela; contenedor VIR (opset-1) publicado aparte. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución / pasos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vela-sd-turbo-int-v2 | Re-cuantización entera de sd-turbo para consenso | 512×512, 1 paso | `.poisd` (int) | other (remite a sd-turbo) | Hugging Face, 0 descargas |
| stabilityai/sd-turbo | Modelo de difusión destilado original | 512×512, 1 paso | safetensors | licencia de Stability AI | Hugging Face |
| Contenedor VIR (opset-1) de Vela | Mismos pesos en formato VIR | 512×512, 1 paso | VIR | no disponible | Publicado por separado por velaresearch |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite generación de texto, código, matemáticas ni razonamiento; su única salida es imagen.
- El prompt está limitado a 75 tokens por el tokenizador CLIP BPE.
- La licencia es "other" y remite a la de `stabilityai/sd-turbo`; es imprescindible revisar esos términos antes de cualquier uso comercial de las imágenes generadas.
- El artefacto está pensado para el consenso de Vela: modificarlo o re-cuantizarlo rompe la validación por hash y el nodo lo rechazará.
- No se documentan sesgos específicos del modelo ni tasas de alucinación; al ser un modelo de imagen, el riesgo relevante es la generación de contenido sesgado o inapropiado según los datos del modelo base.
- No hay información publicada sobre idiomas soportados en los prompts.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún nula fuera de la red Vela.
- No se especifican requisitos de hardware ni opciones de despliegue fuera del ecosistema Vela.

## Enlaces

- Hugging Face: https://huggingface.co/velaresearch/vela-sd-turbo-int-v2
- Modelo base: https://huggingface.co/stabilityai/sd-turbo
- Licencia del modelo base: https://huggingface.co/stabilityai/sd-turbo
