# udgamlabs/Paar-en-pa

## Resumen

Paar English → Punjabi es un modelo de traducción automática neuronal especializado en la dirección inglés → panyabí (gurmuji), desarrollado por Udgam Labs. Se trata de un modelo Marian de 17,3 millones de parámetros, destilado a partir de IndicTrans2 dist-200M mediante el aprendizaje de las traducciones que este modelo mayor produjo sobre corpus en inglés. Su propuesta central es la eficiencia extrema: el fichero int8 ocupa 17,7 MB (19,5 MB con el vocabulario) y se ejecuta íntegramente en CPU, en torno a 37 ms por frase en un solo hilo, o directamente en el navegador mediante transformers.js.

El modelo forma parte de una familia de doce traductores inglés → lenguas índicas (hindi, bengalí, maratí, telugu, tamil, guyaratí, urdu, canarés, malabar, panyabí, odia y asamés), todos con la misma filosofía de despliegue ligero y offline. Está pensado para escenarios donde no hay GPU ni conectividad: extensiones de navegador, aplicaciones de escritorio, dispositivos de bajos recursos o procesamiento por lotes masivo en CPU.

La relevancia actual reside en que cubre un hueco práctico: Firefox no dispone de modelo inglés → panyabí, y las alternativas de mayor calidad (indicMT, IndicTrans2) multiplican por 8,7 el tamaño de descarga. Paar sacrifica entre 2,48 y 3,25 puntos de chrF++ frente a indicMT a cambio de una huella de 19,5 MB y ejecución en un único núcleo de CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | 17.170.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | entradas truncadas a 127 piezas SentencePiece; salida hasta 200 tokens |
| Tipos de cuantizacion | fp32 (original), int8 (CTranslate2 y ONNX) |
| Idiomas soportados | inglés (en) → panyabí (pa, gurmuji) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, CTranslate2 int8, ONNX int8 |

## Arquitectura y entrenamiento

Paar es un transformer encoder-decoder de la familia Marian, con 17,3 millones de parámetros y tokenización SentencePiece. El modelo se entrenó mediante destilación: aprendió a partir de frases en inglés y sus correspondientes traducciones al panyabí generadas por IndicTrans2 dist-200M, un modelo de 211,8 millones de parámetros. El corpus de referencia declarado es ai4bharat/IndicCorpV2. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación principal no es arquitectónica sino de empaquetado y despliegue: el autor publica tres builds del mismo modelo (pesos fp32 en safetensors, CTranslate2 int8 para CPU y ONNX int8 para navegador), con degradación medida y documentada. El build CTranslate2 int8 pierde 0,05 chrF++ respecto a fp32 en FLORES+ y coincide palabra por palabra en el 80 % de las traducciones; el build ONNX int8 queda a 0,08 chrF++ de fp32 en ambos conjuntos de test. La decodificación evaluada es greedy (`num_beams=1`); la búsqueda por haces no se probó.

## Capacidades

- Traducción de texto inglés → panyabí (gurmuji), una frase por entrada.
- Ejecución offline en CPU sin GPU, con latencia de unos 37 ms por frase en un hilo.
- Ejecución en navegador mediante transformers.js y el build ONNX int8 (28,7 MB descargados una sola vez).
- Despliegue con CTranslate2 int8 para procesamiento por lotes de alto rendimiento (unas 185 frases por segundo en lote).
- Integración nativa con la librería transformers (MarianMTModel / MarianTokenizer).
- Conservación de números razonablemente alta: 95,9 % en FLORES+ y 98,8 % en IN22-Conv (frases cuyos números sobreviven íntegros).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción en el navegador sin servidor: una extensión o web app puede cargar el build ONNX int8 (28,7 MB) y traducir texto localmente con transformers.js, sin enviar datos a ningún backend y sin depender de conectividad.
- Aplicaciones de escritorio y móviles con recursos limitados: el fichero int8 de 19,5 MB cabe en el binario de una app y se ejecuta en un solo núcleo de CPU, lo que permite traducción instantánea en equipos sin GPU.
- Procesamiento por lotes masivo en CPU: con CTranslate2 int8 y decodificación en lote se alcanzan unas 185 frases por segundo, adecuado para traducir grandes volúmenes de documentación o subtítulos en servidores sin acelerador.
- Atención al cliente y mensajería: traducción de mensajes cortos en inglés a panyabí en tiempo real dentro de un chat, donde la latencia de decenas de milisegundos y la huella mínima permiten desplegarlo junto al servicio principal.
- Localización de interfaces y contenidos: traducción de cadenas de UI, correos y avisos para comunidades panyabí-hablantes, con la ventaja de que el modelo puede incrustarse en el propio producto.
- Herramientas de accesibilidad y lectura: extensión de navegador que traduzca al vuelo páginas o fragmentos en inglés para usuarios de panyabí, aprovechando que Firefox no ofrece un modelo para este par.
- Pipelines de datos multilingües: generación de pares inglés-panyabí a gran escala para aumentar datasets de entrenamiento o evaluación, dado el bajo coste por frase.

## Benchmarks y rendimiento

chrF++ (mayor es mejor), NFC en ambos lados, mismo conjunto de frases para todos los sistemas. Paar en greedy; indicMT int8 con beam 5; IndicTrans2 dist-200M. Diferencias pareadas con 1.000 remuestreos bootstrap e intervalo de confianza al 95 %. Medición entre el 3 y el 16 de noviembre de 2026. Las puntuaciones de Paar corresponden a los pesos fp32; el build int8 queda a 0,07 chrF++ de ellos.

| Conjunto de test (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) |
|---|---:|---:|---:|
| FLORES+ devtest (1.012) | 49,41 | 51,89 (-2,48 [-2,88, -2,05]) | 52,73 |
| IN22-Conv (1.503) | 51,47 | 54,72 (-3,25 [-3,89, -2,68]) | 55,32 |

- IN22-Gen: 46,42.
- Conservación de números (frases con todos los números intactos): 95,9 % en FLORES+ y 98,8 % en IN22-Conv.
- Tamaño: carpeta int8 de 19,5 MB; ficheros ONNX int8 para navegador de 28,7 MB; indicMT int8 ocupa 169,2 MB.
- Velocidad (Mac mini, FLORES+ devtest): unos 37 ms por frase en un hilo de CPU (CTranslate2 int8, mediana); unas 185 frases por segundo en lote.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo corre en CPU. En fp32 ocupa aproximadamente 69 MB de memoria; en int8, unos 17,7 MB de pesos más el vocabulario.
- GPU recomendadas: no aplica; el diseño está orientado a CPU. Cualquier GPU moderna podría ejecutarlo, pero no aporta ventaja práctica frente al build int8 en CPU.
- Compatibilidad con GPU de consumo: irrelevante por tamaño; cabe holgadamente en cualquier tarjeta, integrada incluida.
- Despliegue: transformers (MarianMTModel), CTranslate2 int8, ONNX Runtime / transformers.js (navegador y Node), y cualquier runtime compatible con ONNX.
- Latencia y throughput: ~37 ms por frase en un hilo de CPU (Mac mini, CTranslate2 int8, mediana); ~185 frases/s en lote. En navegador, la descarga inicial del build int8 es de 28,7 MB.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño int8 | FLORES+ (chrF++) | IN22-Conv (chrF++) | Licencia | Despliegue |
|---|---:|---:|---:|---:|---|---|
| Paar en→pa | 17,3M | 19,5 MB | 49,41 | 51,47 | Apache 2.0 | CPU, navegador, CTranslate2, ONNX |
| indicMT | 153,8M | 169,2 MB | 51,89 | 54,72 | no disponible | int8, beam 5 |
| IndicTrans2 dist-200M | 211,8M | no disponible | 52,73 | 55,32 | no disponible | servidor, GPU/CPU |

Paar es entre 8,7 y 12 veces más pequeño que sus alternativas y pierde entre 2,48 y 3,25 puntos de chrF++ frente a indicMT, con intervalos de confianza pareados que confirman la diferencia. La contrapartida es un despliegue viable en navegador y en CPU de un solo núcleo, algo que las alternativas no ofrecen con ese tamaño.

## Limitaciones y advertencias

- Calidad inferior a indicMT e IndicTrans2: la diferencia es estadísticamente significativa y sistemática en ambos conjuntos de evaluación.
- Procesa una sola frase por entrada; es necesario segmentar párrafos previamente. Las entradas se truncan a 127 piezas.
- Solo se evaluó decodificación greedy; el comportamiento con beam search no está caracterizado.
- Solo traduce inglés → panyabí; no soporta la dirección inversa ni otros pares.
- No hay revisión por hablantes nativos de los ejemplos mostrados; la model card advierte de que las salidas están sin editar e incluyen errores.
- Riesgo de alucinación y de omisión en frases largas o con estructuras poco frecuentes; la conservación de números, aunque alta, no es del 100 % (95,9 % en FLORES+).
- No se documentan sesgos específicos ni la composición detallada del corpus de destilación, lo que limita la auditoría.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del corpus de origen (IndicCorpV2) y de las salidas de IndicTrans2 usadas en la destilación.
- Para producción de alta calidad en panyabí, conviene usar Paar como primera pasada o en entornos con restricciones de recursos, y reservar modelos mayores para revisión o traducción crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Paar-en-pa
- Demo en el navegador (Space): https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de fine-tuning: https://github.com/udgamlabs/paar
- Modelo hermano inglés → hindi: https://huggingface.co/udgamlabs/Paar-en-hi
- Modelo hermano inglés → bengalí: https://huggingface.co/udgamlabs/Paar-en-bn
- Modelo hermano inglés → maratí: https://huggingface.co/udgamlabs/Paar-en-mr
- Modelo hermano inglés → telugu: https://huggingface.co/udgamlabs/Paar-en-te
- Modelo hermano inglés → tamil: https://huggingface.co/udgamlabs/Paar-en-ta
- Modelo hermano inglés → guyaratí: https://huggingface.co/udgamlabs/Paar-en-gu
- Modelo hermano inglés → urdu: https://huggingface.co/udgamlabs/Paar-en-ur
- Modelo hermano inglés → canarés: https://huggingface.co/udgamlabs/Paar-en-kn
- Modelo hermano inglés → malabar: https://huggingface.co/udgamlabs/Paar-en-ml
- Modelo hermano inglés → odia: https://huggingface.co/udgamlabs/Paar-en-or
- Modelo hermano inglés → asamés: https://huggingface.co/udgamlabs/Paar-en-as
- Dataset IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper de referencia (arXiv:2305.16307): https://arxiv.org/abs/2305.16307
