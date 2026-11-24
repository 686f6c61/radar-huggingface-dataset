# spartzjr/hummingbot-v2-dex-cex-market-maker

## Resumen

La ficha solicitada corresponde al identificador de Hugging Face `spartzjr/hummingbot-v2-dex-cex-market-maker`, publicada por el usuario `spartzjr`. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial: la model card describe un supuesto ejecutable portable para Windows x64 denominado `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`, empaquetado en un ZIP de 4,8 MB con contrasena de descompresion. No se declara arquitectura neuronal, parametros, contexto, pesos ni pipeline de inferencia; el campo `pipeline` figura como no disponible.

El contenido de la model card es incoherente con la plataforma: mezcla terminologia de trading algoritmico (Hummingbot, market making DEX/CEX, bundles MEV, copytrade) con nombres de ficheros ajenos al proyecto (referencias a un trainer de trucos para el videojuego inZOI) y enlaces de descarga alojados en repositorios de GitHub de terceros, no en el repositorio de Hugging Face. Los badges afirman 131K descargas y un 99 % de valoracion, mientras que la plataforma registra 0 descargas y 0 likes, lo que indica que esas cifras son inventadas.

Desde el punto de vista de evaluacion tecnica, este artefacto no es utilizable como modelo open source. No hay pesos, tokenizador, configuracion de arquitectura ni datos de entrenamiento verificables, y el binario promocionado se distribuye fuera de Hugging Face con instrucciones que incluyen ejecutarlo como administrador. Se recomienda tratarlo como contenido no fiable y, potencialmente, como distribucion de software malicioso, no como modelo de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se declara arquitectura de red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos de la model card) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (la model card menciona un ZIP con un ejecutable `.exe` para Windows x64, no pesos de modelo) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura, datos de entrenamiento, numero de tokens, composicion del corpus ni tecnicas de alineacion (RLHF, DPO). La model card no contiene seccion de entrenamiento ni referencias a papers o repositorios de codigo del modelo. Los unicos elementos tecnicos mencionados son caracteristicas de un supuesto bot de trading (sandbox de paper trading, motor de bundles Jito/MEV, bundler de 20 wallets con Lookup Tables, filtro de honeypot, enrutamiento de ordenes con latencia inferior a 40 ms), presentadas sin especificacion de implementacion ni trazabilidad.

Los tags de la plataforma (`windows`, `windows-11`, `x64`, `portable`) confirman que el artefacto se presenta como aplicacion de escritorio, no como modelo. No existe innovacion tecnica verificable atribuible a un modelo de IA.

## Capacidades

- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- La model card atribuye al binario funciones de trading: simulacion de estrategias contra libros de ordenes en vivo, construccion de bundles MEV, ejecucion multi-wallet en el mismo bloque, replicacion de wallets de ballenas y filtrado de tokens honeypot.
- Estas funciones no estan documentadas con especificaciones tecnicas, repositorio de codigo fuente ni auditoria, por lo que no pueden considerarse capacidades verificadas.

## Casos de uso

- No procede. Al no existir un modelo de IA con pesos, tokenizador o API de inferencia, no hay escenarios de uso legitimos que documentar.
- Evaluacion de procedencia de artefactos: el caso util real es usar esta publicacion como ejemplo de model card fraudulenta para formar criterios de deteccion (badges con cifras infladas, enlaces de descarga externos, contrasenas en el README, instrucciones de ejecucion como administrador).
- Analisis de seguridad: inspeccionar el ZIP y el ejecutable en un entorno aislado para determinar si contiene malware, dado que se distribuye fuera de la plataforma y solicita privilegios elevados.
- Moderacion de repositorios: servir como referencia para politicas que bloqueen publicaciones con enlaces a binarios externos no verificados.
- Formacion de equipos de compras: ilustrar por que no debe adquirirse ni desplegarse software cuya cadena de suministro no es auditable.
- No se identifican casos de uso de trading responsables: cualquier despliegue de un bot de market making requiere codigo fuente auditable, claves gestionadas de forma segura y cumplimiento normativo, nada de lo cual esta presente aqui.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (131K descargas, 99 % de valoracion, 429 Hz y 454 Hz de polling, latencia inferior a 40 ms, consumo inferior a 21 MB de RAM) son afirmaciones del autor sin metodologia, sin entorno de prueba declarado y contradichas por los contadores de la propia plataforma (0 descargas, 0 likes). No deben citarse como resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo neuronal que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisitos declarados del artefacto: Windows x64 moderno (se menciona Windows 11), ejecutable de 4,8 MB, instrucciones para ejecutarlo como administrador tras descomprimir con contrasena.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Frente a los proyectos que inspira nominalmente, la diferencia es sustancial:

| Criterio | Este artefacto | Hummingbot (proyecto original) |
|---|---|---|
| Naturaleza | Binario `.exe` empaquetado en ZIP, distribuido fuera de Hugging Face | Framework open source de market making, codigo Python auditable |
| Codigo fuente | No disponible | Publico en GitHub |
| Pesos de modelo | No disponibles | No aplica (no es un modelo neuronal) |
| Trazabilidad de build | No disponible | Reproducible desde el repositorio |
| Licencia | MIT declarada, sin fichero de licencia verificable en el artefacto | Licencia del proyecto original |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede integrarse en pipelines de inferencia.
- Incoherencia de identidad: el nombre del artefacto (`inzoi-cheat-trainer-mod-menu`) no guarda relacion con Hummingbot ni con trading, lo que sugiere reutilizacion de una plantilla de model card o suplantacion.
- Indicadores de fraude: badges con cifras de descargas y valoracion incompatibles con los contadores reales de la plataforma, enlaces de descarga a repositorios de terceros y contrasena de descompresion publicada en el README.
- Riesgo de seguridad: instrucciones para ejecutar un binario desconocido como administrador en Windows; no hay hash, firma ni auditoria publicados. Debe tratarse como potencial malware.
- Riesgo financiero: las funciones de trading atribuidas (bundles MEV, copytrade, ejecucion multi-wallet) implican manejo de claves privadas y capital; no existe evidencia de que sean seguras ni de que respeten requisitos regulatorios.
- Licencia: MIT declarada en metadatos, pero sin fichero de licencia ni codigo fuente en el artefacto, por lo que la cobertura legal del binario es dudosa.
- Idiomas: la lista de 14 idiomas figura en metadatos sin evidencia de capacidades linguisticas reales.
- Recomendacion: no descargar, no ejecutar y no desplegar. Reportar la publicacion a Hugging Face como contenido enganoso.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/spartzjr/hummingbot-v2-dex-cex-market-maker
- Enlace de descarga externo citado en la model card (no verificado, no recomendado): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Repositorio de terceros citado como origen de releases (no verificado): https://github.com/RiyaJeong/hummingbot-v2-dex-cex-market-maker
- No se han encontrado papers, blogs, repositorios de codigo del modelo ni demos en la informacion disponible.
