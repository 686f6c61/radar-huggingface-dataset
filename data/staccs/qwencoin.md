# staccs/qwencoin

## Resumen

Qwencoin es un proyecto experimental publicado por el usuario staccs en Hugging Face que combina un modelo de lenguaje con una cadena de bloques derivada de Bitcoin. Su pieza central es `qwensha`, un modelo de 328 millones de parámetros basado en la arquitectura Qwen3.5 (Gated DeltaNet + SwiGLU) en el que se han compilado los pesos para que ejecute SHA-256 de forma exacta dentro de su propio flujo de tokens, sin cálculo aproximado ni código auxiliar en el host.

Sobre esa base, el autor construye una bifurcación de Bitcoin Inquisition v29.4 con ord 0.29.1 en la que la función de proof of work no es el hash del cabecero, sino una pasada por las 72 matrices MLP de Qwen3.5-0.8B (264.241.152 multiplicaciones-suma en punto fijo de 16 bits). Además, añade un grafo de identidades con staking y slashing sobre ordinals y un modelo de chat fusionado (2.18B parámetros) que declara 23 funciones para operar su propio nodo.

El proyecto es relevante como demostración de investigación sobre compilación de circuitos en pesos de transformers y sobre el uso de modelos como primitiva criptográfica, pero no es un modelo de propósito general ni un producto listo para producción: el repositorio tiene 0 descargas, 0 likes, no publica checkpoints finales y su model card es fundamentalmente una descripción de sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (Gated DeltaNet + SwiGLU) con circuito SHA-256 compilado en pesos |
| Parametros totales | 328M (qwensha); 2.18B en el modelo fusionado de chat |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el proof of work usa punto fijo de 16 bits con `rint(4096 w)`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repo de 0.1 GB; se menciona `qwork.bin` de 504 MB como tabla de trabajo) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5, un transformer con capas Gated DeltaNet y SwiGLU. El componente `qwensha` son cinco capas de esa arquitectura sin modificar, cargadas por la clase estándar `Qwen3_5ForCausalLM`, en las que cada peso es un coeficiente del circuito SHA-256 multiplicado por una potencia de dos. El modelo emite la ejecución completa del hash como tokens: IV, padding, 64 rondas, sumas de encadenamiento y digest. No hay aprendizaje ni aproximación en ese circuito.

El modelo de chat fusionado se obtiene mergeando el circuito en Qwen3.5-0.8B (hidden de 1024 a 2240, 2.18B parámetros). Según el autor, el digest coincide con `hashlib`, la respuesta de Qwen tras el hash coincide token a token con el modelo base (78 de 78) y la KL respecto al base es 8,1e-4 frente a un suelo de medida de 4,7e-4. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO, ya que el proceso descrito es de compilación y merge, no de entrenamiento convencional.

## Capacidades

- Generación de texto conversacional heredada de Qwen3.5-0.8B en el checkpoint fusionado.
- Ejecución nativa de SHA-256 dentro del flujo de tokens: el modelo escribe la llamada `sha256(hex)` y responde con 457 tokens de hash en el mismo `generate()`, devolviendo el digest como respuesta de herramienta.
- Tool calling: la plantilla de chat declara 23 funciones cuando el llamador no declara ninguna (hasher en pesos, cadena, wallet, ord, grafo y passthrough a `qwencoin-cli` y `ord`).
- Operación de nodo: el modelo puede mover monedas, inscribir, hacer staking y publicar mensajes firmados contra nodos en ejecución.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre compilación de circuitos en pesos: usar `qwensha` como referencia para estudiar cómo se codifica una función criptográfica exacta en los pesos de un transformer y se verifica token a token.
- Verificación de integridad reproducible: emplear el hasher en pesos como componente auditable en pipelines donde se quiera comprobar que un digest se ha calculado sin código externo.
- Experimentación con proof of work basado en modelos: montar una red local de cuatro nodos con `tools/pipeline.sh` para estudiar consenso donde el trabajo depende de los pesos del modelo.
- Estudio de grafos de identidad con slashing: desplegar el stack ord + nodo para analizar mecanismos de sybil resistance basados en monedas en riesgo.
- Pruebas de agentes que operan infraestructura: evaluar las 23 funciones declaradas por la plantilla para medir qué acciones (mover fondos, parar nodo, exportar claves) se rechazan correctamente.
- Docencia y demostraciones de criptografía aplicada: reproducir en Linux x86-64 o WSL2, sin GPU ni sudo, el pipeline completo de minado, relay y acuerdo entre nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: el pipeline descrito funciona en Linux x86-64 o Windows mediante WSL2, sin sudo.
- El modelo `qwensha` es de 328M parámetros y el fusionado de 2.18B, por lo que la inferencia cabe en CPU y en GPUs de consumo, aunque no se especifican cifras de VRAM.
- El proof of work usa 264.241.152 multiplicaciones-suma en punto fijo de 16 bits por intento de nonce, con una tabla de trabajo `qwork.bin` de 504 MB.
- Despliegue mediante el script `tools/pipeline.sh` (tabla, 4 nodos, merge, check y publish); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidad especial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwencoin (qwensha) | 328M / 2.18B fusionado | No disponible | SHA-256 compilado en pesos y proof of work | Apache-2.0 | Repo de 0.1 GB, sin checkpoints publicados |
| Qwen3.5-0.8B (base) | 0.8B | No disponible | Modelo de chat general | No disponible | Disponible como checkpoint estándar |
| qwenputer | No disponible | No disponible | Máquina compilada en pesos | No disponible | GitHub público |

## Limitaciones y advertencias

- El repositorio no contiene checkpoints finales publicados: el autor indica explícitamente "(none pushed yet)".
- El proyecto no es un modelo de propósito general; su valor es experimental y su model card describe un sistema completo más que un checkpoint evaluable.
- No hay datos sobre sesgos, alucinación, cobertura idiomática ni evaluación estándar del modelo de chat.
- El proof of work depende de los pesos: perder o alterar la tabla `qwork.bin` (504 MB) impide minar o verificar; el autor señala que un nodo rechaza arrancar si un solo peso de 264 millones difiere.
- La cadena es una bifurcación propia con su propio génesis y magic de red, no una testnet de Bitcoin; no debe confundirse con la red principal.
- Aunque la licencia es Apache-2.0, el uso en producción de las funciones que mueven fondos o gestionan claves requiere auditoría independiente.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- https://huggingface.co/staccs/qwencoin
- https://github.com/divagr18/qwenputer
