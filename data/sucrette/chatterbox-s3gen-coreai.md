# sucrette/chatterbox-s3gen-coreai

## Resumen

Chatterbox S3Gen flow and vocoder for Core AI es una conversion del tramo de sintesis de voz de Resemble AI Chatterbox (licencia MIT) al formato de Apple Core AI (`.aimodel`, macOS 27). No se trata de un modelo de texto a voz completo: este repositorio contiene unicamente la mitad "speech-token-to-waveform", es decir, el flujo S3Gen (convierte tokens de habla en mel-espectrograma mediante un esquema MeanFlow de 2 pasos) y el vocoder HiFT (convierte el mel en audio a 24 kHz). La parte texto-a-token (T3) vive en repositorios separados del mismo autor.

El trabajo lo publica el usuario sucrette y esta pensado para ejecutarse en el chip grafico de los Mac con Apple silicon a traves del runtime Core AI. Los pesos proceden de `s3gen_meanflow.safetensors` del modelo ResembleAI/chatterbox-nano, que comparte pesos con chatterbox-turbo, de modo que esta pieza sirve tanto al pipeline nano como al turbo.

Su interes ahora mismo es practico: es una de las pocas conversiones publicas de un vocoder TTS de calidad a Core AI con particionado en ventanas de streaming (48 tokens en el flujo, 58 frames en el vocoder), lo que permite inferencia por trozos con fase continua en lugar de sintesis por lotes. El prompt de voz (x-vector) es una entrada mas del grafo, por lo que un unico modelo sirve para cualquier voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flujo S3Gen (flow matching, MeanFlow de 2 pasos) + vocoder HiFT (tipo HiFi-GAN), exportados a grafos Core AI `.aimodel` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventanas fijas de streaming: 48 tokens en el flujo, 58 frames en el vocoder |
| Tipos de cuantizacion | fp16 (grafo del flujo); float32 en `vocf0` y `vocbody` |
| Idiomas soportados | no disponible (depende del modelo T3 que aporte los tokens) |
| Licencia | MIT (Copyright 2025 Resemble AI); S3Gen y HiFT derivan de CosyVoice (Apache 2.0) |
| Formato de pesos | `.aimodel` (Core AI); origen en safetensors (`s3gen_meanflow.safetensors`) |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una conversion y particionado de pesos ya existentes. El flujo S3Gen transforma tokens de habla en mel-espectrograma mediante un esquema de flow matching con 2 pasos de muestreo (MeanFlow), heredado de CosyVoice. El vocoder HiFT (familia HiFi-GAN) convierte el mel en onda de 24 kHz y se ha dividido en dos grafos: `vocf0` (mel a frecuencia fundamental F0) y `vocbody` (mel + fuente armonica a forma de onda). La excitacion armonica (SineGen y SourceModuleHnNSF) se ha dejado fuera de los grafos y la genera el host a partir de F0 con un acumulador de fase continuo, de manera que la fase no se rompe entre ventanas.

La conversion se hizo con `tools/export_flow.py` y `tools/export_vocoder.py` del proyecto Asa, con versiones fijadas: chatterbox-tts @ `5de7a54aa4e5`, coreai-core 1.0.0b3, coreai-torch 0.4.3, torch 2.13.0 y torchaudio 2.11.0. No hay datos de entrenamiento ni de dataset en la informacion disponible, porque el modelo base se limita a reutilizar los pesos de chatterbox-nano. La innovacion tecnica destacable es el troceado en ventanas de streaming: 15 tokens comprometidos, 25 de contexto izquierdo y 8 de lookahead en el flujo; 30 frames mas 16 de solape y 12 de contexto en el vocoder.

## Capacidades

- Conversion de tokens de habla a mel-espectrograma mediante `flowp_48_fp16.aimodel` (entrada `tokens` int32 `[1, 48]`, salida `mel` fp16 `[1, 80, 96]`).
- Estimacion de F0 a partir del mel con `vocf0_58.aimodel` (mel float32 `[1, 80, 58]` a `f0` `[1, 58]`).
- Sintesis de forma de onda a 24 kHz con `vocbody_58.aimodel` (salida `wav` float32 `[1, 27840]`).
- Condicionamiento por voz mediante prompt: `ptok` (tokens de prompt), `pfeat` (mel de prompt) y `spks` (x-vector normalizado), de modo que un solo grafo cubre cualquier voz.
- Inferencia por ventanas con fase continua, apta para streaming en lugar de generacion por lotes.
- Ejecucion en GPU de Apple silicon via Core AI sobre macOS 27.
- No realiza texto a voz por si solo: requiere un modelo T3 que produzca los tokens de habla.
- Soporte de tool calling, agentes, vision, audio de entrada y razonamiento: no aplica (no es un modelo de lenguaje).

## Casos de uso

- Sintesis de voz en aplicaciones macOS nativas: integrar el grafo en una app de Apple silicon para generar audio a 24 kHz en el dispositivo, sin enviar texto ni voz a la nube.
- Lectura por voz en streaming: el particionado en ventanas de 48 tokens permite empezar a reproducir audio antes de terminar la frase, util en lectores de pantalla o asistentes conversacionales.
- Clonacion de voz con multiples locutores: al ser el x-vector una entrada del grafo, un unico `.aimodel` sirve para varias voces y solo hay que cambiar el prompt de voz.
- Asistentes de voz embebidos en Mac: combinado con un modelo T3 ligero, permite construir un pipeline TTS completo que no sale del equipo.
- Doblaje y locucion de contenido corto: generar versiones habladas de textos con control de la voz de referencia, dentro de un flujo de produccion local.
- Investigacion en TTS en el dispositivo: sirve como referencia de conversion de vocoders HiFi-GAN a Core AI y para medir desviacion numerica frente a PyTorch.
- Prototipado de interfaces de voz accesibles: al no requerir GPU dedicada, se puede desplegar en portatiles Mac para pruebas de usabilidad.
- Evaluacion de calidad de vocoder: util para comparar el vocoder HiFT de Chatterbox con alternativas dentro del mismo runtime Core AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje. La model card si incluye metricas de fidelidad numerica frente a la implementacion de referencia en PyTorch, que se recogen a continuacion.

| Metrica | Valor |
|---|---|
| Error absoluto medio (MAE) del mel del flujo vs. PyTorch eager | 0.0020 (grafo fp16, referencia fp32) |
| Error maximo, fuente del host + cuerpo del vocoder vs. `hg.inference` de Chatterbox | 1.27e-6 |
| Error medio, misma comparacion | 6.8e-8 (senal media absoluta 0.019) |
| Validacion end-to-end | `swift test` de Asa y `asa-tts` |
| Entorno de medida | Mac Apple silicon, macOS 27, Core AI GPU, coreai-core 1.0.0b3 |

## Requisitos de hardware

- Ejecucion en GPU de Apple silicon mediante Core AI; el runtime probado es coreai-core 1.0.0b3 sobre macOS 27.
- Tamano del repositorio: 0.4 GB, que incluye los tres grafos `.aimodel`. La VRAM/unified memory necesaria no esta indicada de forma explicita.
- No se especifican GPU recomendadas del ecosistema NVIDIA (A100, H100, RTX 4090) porque el modelo esta exportado a formato Core AI, no a PyTorch ni GGUF.
- No cabe en GPU consumer de tipo NVIDIA tal cual: esta orientado a memoria unificada de Apple silicon.
- Opciones de despliegue: runtime Core AI, integracion via el proyecto Asa (`AsaTTS.SpeechSynthesizer`) y `asa-tts`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chatterbox-s3gen-coreai | Vocoder + flujo S3Gen para TTS | `.aimodel` (Core AI) | 48 tokens flujo / 58 frames vocoder | MIT (partes CosyVoice Apache 2.0) | HuggingFace, 0 descargas |
| ResembleAI/chatterbox-nano | Modelo Chatterbox completo (origen de pesos) | safetensors, PyTorch | no disponible | MIT | HuggingFace |
| ResembleAI/chatterbox-turbo | Modelo Chatterbox completo | safetensors, PyTorch | no disponible | MIT | HuggingFace |
| sucrette/chatterbox-nano-t3-coreai | Mitad T3 (texto a token) para Core AI | `.aimodel` | no disponible | MIT | HuggingFace |
| sucrette/chatterbox-turbo-t3-coreai | Mitad T3 (texto a token) para Core AI | `.aimodel` | no disponible | MIT | HuggingFace |

Comparativas con vocoders alternativos (HiFi-GAN, BigVGAN, CosyVoice) en cuanto a calidad o velocidad: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de texto a voz autonomo: necesita un modelo T3 (por ejemplo, chatterbox-nano-t3-coreai o chatterbox-turbo-t3-coreai) que genere los tokens de habla.
- Solo funciona en el ecosistema Core AI de Apple; no es portable directamente a PyTorch, GGUF ni a runtimes de servidor habituales.
- La excitacion armonica no esta incluida en los grafos: el host debe implementarla a partir de F0 con un acumulador de fase, lo que anade trabajo de integracion y es una fuente potencial de errores.
- Idiomas soportados: no disponibles en la informacion del repositorio; dependen del modelo T3 que se use.
- Sesgos conocidos, riesgo de alucinacion o comportamiento anomalo en la sintesis: no documentados en la informacion disponible.
- Uso comercial: la licencia es MIT, pero las partes derivadas de CosyVoice estan sujetas a Apache 2.0, por lo que conviene revisar ambas condiciones.
- Es una pieza con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por terceros.
- Solo se ha verificado en Mac Apple silicon con macOS 27 y coreai-core 1.0.0b3: no hay datos de compatibilidad con otras versiones o plataformas.
- Al ser un componente de conversion de pesos, no incorpora ninguna mejora de calidad respecto al Chatterbox original; su aportacion es el formato y el troceado en streaming.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sucrette/chatterbox-s3gen-coreai
- Modelo base Chatterbox Nano: https://huggingface.co/ResembleAI/chatterbox-nano
- Repositorio oficial de Chatterbox: https://github.com/resemble-ai/chatterbox
- Mitad T3 de Chatterbox Nano en Core AI: https://huggingface.co/sucrette/chatterbox-nano-t3-coreai
- Mitad T3 de Chatterbox Turbo en Core AI: https://huggingface.co/sucrette/chatterbox-turbo-t3-coreai
- Proyecto Asa (runtime para el que se convirtio): https://github.com/ayasena/Asa
