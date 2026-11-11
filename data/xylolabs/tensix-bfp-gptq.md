# Xylolabs/tensix-bfp-gptq

## Resumen

`tensix-bfp-gptq` es una herramienta de cuantización desarrollada por Xylolabs que convierte las capas lineales de modelos LLM de Hugging Face a los formatos de coma flotante por bloques nativos de TT-NN: `ttnn.bfloat4_b` (BFP4) y `ttnn.bfloat8_b` (BFP8). No es un modelo de lenguaje en sí, sino un pipeline de cuantización post-entrenamiento basado en GPTQ (Frantar et al., 2022) orientado específicamente a las NPU Tensix de Tenstorrent. El resultado es un checkpoint estándar en safetensors con precisión bf16 cuyos valores ya están alineados a la rejilla del formato destino, de modo que TT-NN lo empaqueta sin redondear de nuevo y `transformers` en CPU o GPU ejecuta exactamente los mismos pesos que correrá la NPU.

La relevancia técnica reside en el mapeo entre el layout de TT-NN y el de PyTorch: TT-NN calcula `x @ W` con `W` en disposición `[in, out]`, la transpuesta del peso de un `Linear`. En layout de tiles, cada bloque de 16 valores consecutivos de una fila comparte un único exponente de 8 bits (el mayor de los 16), y cada valor conserva signo y mantisa con bit implícito: 3 bits para BFP4 y 7 para BFP8, lo que equivale a 4,5 y 8,5 bits por peso respectivamente. La herramienta replica bit a bit el empaquetador host de tt-metal, verificado contra `ttnn.as_tensor`.

El proyecto declara soporte para familias concretas de modelos (Qwen3, Qwen2.5, Qwen3.5/3.8, Gemma 4, Ministral 3 y Llama 3.x), con configuraciones de calibración basadas en WikiText-2 y extractos de Wikipedia en coreano. Se distribuye bajo licencia Apache-2.0 y depende de Python 3.11+ y, para el extra `ttnn`, de Python 3.12 sobre Linux x86_64 con glibc 2.34 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Herramienta de cuantizacion GPTQ para formatos block floating point de TT-NN (no es un modelo transformer) |
| Parametros totales | no disponible (depende del modelo de entrada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo cuantizado) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) y BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso); metodos GPTQ y round-to-nearest; variante `exp` para BFP4 |
| Idiomas soportados | no disponible (los textos de calibracion son WikiText-2 en ingles y extractos de Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors bf16 con valores alineados a la rejilla BFP; empaquetado posterior por TT-NN |

## Arquitectura y entrenamiento

La herramienta opera sobre las capas lineales de un LLM preentrenado de Hugging Face. Su funcionamiento se apoya en tres piezas: un empaquetador BFP que reproduce bit a bit el de tt-metal (`tensix_bfp.bfp.bfp()`, validado en `tests/test_ttnn_pack.py` contra `ttnn.as_tensor`); un bucle GPTQ que redondea canal de entrada a canal de entrada propagando el error de cada columna hacia las columnas aún no redondeadas; y una variante para BFP4, `exp`, que prueba un escalón inferior de exponente por bloque y conserva el que minimiza el error. Bajar un escalón recorta los valores máximos en el código superior y coloca el resto en una rejilla el doble de fina.

No hay entrenamiento ni ajuste fino: es cuantización post-entrenamiento. La calibración consume `[calib] tokens` repartidos uniformemente entre `[calib] texts` en secuencias de `[calib] seq`; para Llama, Ministral 3 y Gemma 4 cada secuencia arranca con el token de inicio de secuencia, siguiendo el criterio de la herramienta de perplejidad de llama.cpp. Los textos de calibración son WikiText-2 (train y test, CC BY-SA 3.0 y GFDL) y extractos de artículos de Wikipedia en coreano (CC BY-SA 4.0), descargados de sus fuentes originales y verificados por SHA-256, con la advertencia de que los artículos de Wikipedia cambian y una descarga nueva puede no coincidir con el hash registrado.

Una innovación destacable es la fidelidad de empaquetado: los valores permanecen exactos siempre que el runtime los empaquete como `[in, out]` en su propio formato o en uno más ancho, como ocurre con `ttnn.as_tensor`, con tt-transformers usando `--use_hf_rope` y con las demos de tt-metal en dtypes coincidentes. En cambio, tt-transformers sin `--use_hf_rope` y `experimental_weight_dtype` de tt-forge los redondean de nuevo.

## Capacidades

- Cuantización GPTQ de capas lineales de LLM de Hugging Face a BFP4 y BFP8 de TT-NN, con modo round-to-nearest alternativo.
- Reproducción bit a bit del empaquetador host de tt-metal, verificada contra `ttnn.as_tensor`.
- Soporte de familias de modelos: Qwen3 denso (4B, 8B), Qwen2.5 (7B, con sesgos q, k y v tal como están almacenados), Qwen3.5/3.8 denso con Gated DeltaNet y atención con puertas (4B, 9B, 27B, arete-27b), Gemma 4 (E2B, E4B, 31B, variantes QAT y 12B unified), Ministral 3 14B (modelo de texto, desde copia solo-texto) y Llama 3.1 8B.
- Variante `exp` específica para BFP4 que optimiza el exponente por bloque.
- Herramientas de calibración: descarga y verificación de textos (`python -m tensix_bfp.data fetch` y `check`).
- Compatibilidad con `ttnn.as_tensor`, tt-transformers con `--use_hf_rope` y demos de tt-metal en dtypes coincidentes.
- Soporte de ejecución sin tarjeta Tenstorrent mediante el simulador ttsim (probado con v1.16.0) y round trips de dispositivo con SFPI 7.89.0.
- No incluye generación de texto, razonamiento, código, visión ni tool calling propios: esas capacidades dependen del modelo de entrada.

## Casos de uso

- Despliegue de LLM en NPU Tenstorrent: cuantizar un Qwen3-8B o Llama 3.1-8B a BFP8 para ejecutarlo en hardware Tensix con pesos que coinciden exactamente con los que verá la NPU, evitando discrepancias entre el checkpoint y el runtime.
- Validación previa al despliegue: ejecutar el checkpoint cuantizado en CPU o GPU con `transformers` para medir perplejidad o calidad antes de moverlo al acelerador, ya que los pesos son los mismos que correrá la NPU.
- Reducción de huella de memoria en inferencia: BFP4 a 4,5 bits por peso y BFP8 a 8,5 bits permiten ajustar modelos de 7B-27B en memorias de dispositivo más ajustadas, con GPTQ mitigando la pérdida de precisión.
- Integración en pipelines de CI: usar `tests/test_ttnn_pack.py` y la verificación de hashes de calibración para comprobar que una actualización de tt-metal no rompe el empaquetado bit a bit.
- Investigación en cuantización: comparar GPTQ frente a round-to-nearest y la variante `exp` frente al redondeo estándar en BFP4 sobre las familias soportadas, con calibración controlada y reproducible.
- Prototipado sin hardware: emplear ttsim para validar el empaquetado y los round trips de dispositivo en máquinas sin tarjeta Tenstorrent, útil en entornos de desarrollo o contenedores.
- Preparación de modelos para tt-transformers y tt-forge: generar checkpoints con el layout correcto y documentar qué rutas de runtime preservan los valores exactos y cuáles los redondean de nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de perplejidad, MMLU, HumanEval ni métricas de latencia o throughput para las variantes cuantizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; depende del modelo de entrada. Como referencia de formato, BFP4 ocupa 4,5 bits por peso y BFP8 8,5 bits por peso en las capas lineales cuantizadas.
- GPU recomendadas: no especificadas. La herramienta se ha probado en Ubuntu 24.04; el extra `ttnn` requiere Linux x86_64 con glibc 2.34 o superior.
- Cabe en consumer GPU: no disponible. El checkpoint resultante es bf16 safetensors y puede ejecutarse con `transformers` en CPU o GPU, pero no se documentan requisitos de memoria.
- Opciones de despliegue: TT-NN (`ttnn.as_tensor`), tt-transformers (con `--use_hf_rope` para preservar los valores exactos), tt-forge (`experimental_weight_dtype`, que redondea de nuevo), `transformers` en CPU/GPU, y el simulador ttsim v1.16.0 sin tarjeta Tenstorrent.
- Latencia y throughput: no disponibles.
- Entorno: Python 3.11+ (probado de 3.11 a 3.15); `.[ttnn]` requiere Python 3.12 porque ttnn 0.81.1 solo publica wheels para CPython 3.10 y 3.12. tt-metal v0.81.1 está compilado para Ubuntu 22.04 y 24.04; Ubuntu 26.04 no figura en esa lista aunque su glibc sea suficiente para el wheel, y su Python de sistema es 3.14, por lo que requiere un Python 3.12 aparte (por ejemplo, `uv venv --python 3.12`). Los round trips de dispositivo necesitan SFPI 7.89.0.

## Comparativa con modelos similares

| Herramienta | Formato destino | Metodo | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tensix-bfp-gptq | BFP4 / BFP8 (TT-NN) | GPTQ, round-to-nearest, variante `exp` | NPU Tensix de Tenstorrent | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| AutoGPTQ | INT4 / INT8 | GPTQ | GPU generica | no disponible en la informacion | no disponible |
| GPTQ-for-LLaMa | INT4 | GPTQ | GPU generica | no disponible en la informacion | no disponible |
| llama.cpp (cuantizacion) | GGUF (Q4_K, Q8_0, etc.) | k-quants, round-to-nearest | CPU/GPU | no disponible en la informacion | no disponible |

La informacion proporcionada no incluye datos de rendimiento de estas alternativas ni una comparacion oficial por parte del autor; la tabla recoge unicamente la categoria funcional. No disponible comparativa cuantitativa de perplejidad o precision.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, razona ni responde peticiones por sí mismo. Cualquier evaluación de capacidades debe hacerse sobre el modelo de entrada.
- Solo cubre las familias y configuraciones listadas; modelos fuera de `qwen3`, `qwen2`, `qwen3_5`, `gemma4`, `gemma4_unified`, `ministral3` y `llama` no están soportados de forma declarada.
- La preservación exacta de los valores depende del runtime: tt-transformers sin `--use_hf_rope` y `experimental_weight_dtype` de tt-forge redondean de nuevo los pesos.
- Los artículos de Wikipedia usados para calibración cambian con el tiempo; una descarga nueva de los extractos en coreano puede no coincidir con el SHA-256 registrado, lo que afecta a la reproducibilidad.
- El extra `.[ttnn]` solo funciona en Python 3.12 y Linux x86_64 con glibc 2.34+; en otras plataformas se instala sin ttnn.
- Ubuntu 26.04 no está en la lista de soporte de tt-metal v0.81.1 y requiere un Python 3.12 separado.
- Sin tarjeta Tenstorrent se necesita el simulador ttsim; los round trips de dispositivo requieren además SFPI 7.89.0, y para tt-metal anterior a v0.83 el `soc_descriptor.yaml` debe situarse junto a la librería del simulador.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas propias, ya que estos dependen del modelo cuantizado.
- La licencia Apache-2.0 se aplica a la herramienta; el uso comercial del modelo resultante queda sujeto a la licencia del modelo de entrada.
- Con 0 descargas y 0 likes, no hay evidencia de uso en producción ni validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/tensix-bfp-gptq
- Organización en Hugging Face: https://huggingface.co/Xylolabs
- Repositorio GitHub (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/tensix-bfp-gptq/blob/main/LICENSE
- tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/releases/tag/v0.81.1
- Simulador ttsim: https://github.com/tenstorrent/ttsim
- SFPI 7.89.0: https://github.com/tenstorrent/sfpi/releases/download/7.89.0/sfpi_7.89.0_x86_64_debian.txz
